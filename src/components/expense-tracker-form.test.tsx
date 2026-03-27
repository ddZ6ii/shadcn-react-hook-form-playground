import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExpenseTrackerForm } from '@/components'
import { setupFormSubmission } from '@/tests/utils/setup-submission'
import { categories, type Category } from '@/types'

type FormData = Parameters<
  NonNullable<React.ComponentProps<typeof ExpenseTrackerForm>['onSubmit']>
>[0]

const validFormData: FormData = {
  description: 'Valid description',
  amount: 10.99,
  category: 'groceries',
}
const invalidFormData: Omit<FormData, 'category'> & {
  category: Category | undefined
} = {
  description: 'ab',
  amount: 0,
  // Unselected category should be treated as invalid since it's required
  category: undefined,
}

describe('ExpenseTrackerForm', () => {
  function getFormElements() {
    return {
      descriptionInput: screen.getByLabelText(/description/i),
      amountInput: screen.getByLabelText(/amount/i),
      categorySelect: screen.getByLabelText(/category/i),
      selectTrigger: screen.getByTestId('select-trigger-category'),
      submitButton: screen.getByRole('button', { name: /submit/i }),
    }
  }

  // Non-submission related tests
  describe('form display and validation', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
      user = userEvent.setup()
      render(<ExpenseTrackerForm />)
    })

    it('renders form with description field, amount field, category select and submit button', () => {
      const {
        descriptionInput,
        amountInput,
        categorySelect,
        selectTrigger,
        submitButton,
      } = getFormElements()

      expect(descriptionInput).toBeInTheDocument()
      expect(amountInput).toBeInTheDocument()
      expect(categorySelect).toBeInTheDocument()
      expect(selectTrigger).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })

    it('shows error when description is shorter than 3 characters', async () => {
      const { descriptionInput } = getFormElements()

      await user.type(descriptionInput, invalidFormData.description)
      await user.tab()

      expect(
        await screen.findByText(/description must be at least 3 characters./i),
      ).toBeInTheDocument()
    })

    it('shows error when description exceeds 100 characters', async () => {
      const { descriptionInput } = getFormElements()

      await user.click(descriptionInput)
      await user.paste('a'.repeat(101)) // much faster than user.type() since it fires a single event instead of multiple keyboard cycles
      await user.tab()

      expect(
        await screen.findByText(/description must be at most 100 characters./i),
      ).toBeInTheDocument()
    })

    it('shows error when amount has a negative value', async () => {
      const { amountInput } = getFormElements()

      await user.type(amountInput, '-10')
      await user.tab()

      expect(
        await screen.findByText(/amount must greater than 0./i),
      ).toBeInTheDocument()
    })

    it('shows error when amount is too small', async () => {
      const { amountInput } = getFormElements()

      await user.type(amountInput, '0.003')
      await user.tab()

      expect(
        await screen.findByText(/amount must be at least 0.01./i),
      ).toBeInTheDocument()
    })

    it('shows error when amount is too large', async () => {
      const { amountInput } = getFormElements()

      await user.type(amountInput, '1000001')
      await user.tab()

      expect(
        await screen.findByText(/amount must be less than 1,000,000./i),
      ).toBeInTheDocument()
    })

    it('shows error when category is not selected', async () => {
      const { selectTrigger } = getFormElements()

      // Open select dropdown:
      // focus moves to portal → trigger blurs → onBlur fires
      await user.click(selectTrigger)

      expect(
        await screen.findByText(/a category is required./i),
      ).toBeInTheDocument()
    })

    it('displays the list of categories', async () => {
      const { selectTrigger } = getFormElements()

      // Open select dropdown
      await user.click(selectTrigger)

      for (const category of categories) {
        // Radix renders both a hidden native <option> (for form submission) and a visible <span> in the portal. findByText matches both.
        // Use findByRole('option') instead — it targets only the Radix dropdown items.
        const option = await screen.findByRole('option', { name: category })
        expect(option).toBeInTheDocument()
      }
    })
  })

  // Submission related tests (need fake timers + onSubmit)
  describe('form submission', () => {
    // Registers beforeEach/afterEach hooks and returns a ctx object mutated before each test.
    const ctx = setupFormSubmission<FormData>(ExpenseTrackerForm)

    async function submitValidForm(u: ReturnType<typeof userEvent.setup>) {
      const { descriptionInput, amountInput, selectTrigger, submitButton } =
        getFormElements()

      await u.type(descriptionInput, validFormData.description)
      await u.type(amountInput, validFormData.amount.toString())

      // Open select dropdown
      await u.click(selectTrigger)
      //Pick item
      await u.click(
        await screen.findByRole('option', {
          name: validFormData.category,
        }),
      )

      await u.click(submitButton)
    }

    async function getSuccessScreenElements() {
      const [heading, addNewExpenseButton] = await Promise.all([
        screen.findByRole('heading', {
          name: /your new expense has been added successfully!/i,
        }),
        screen.findByRole('button', {
          name: /add a new expense/i,
        }),
      ])
      return { heading, addNewExpenseButton }
    }

    it('shows spinner and disables fieldset while submitting', async () => {
      const { descriptionInput, amountInput, selectTrigger, submitButton } =
        getFormElements()

      await ctx.user.type(descriptionInput, validFormData.description)
      await ctx.user.type(amountInput, validFormData.amount.toString())
      await ctx.user.click(selectTrigger)
      await ctx.user.click(
        await screen.findByRole('option', {
          name: validFormData.category,
        }),
      )
      // Wait for Radix to finish closing
      await waitFor(() =>
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
      )

      // Starts submission without awaiting to observe the loading state (fire-and-forget).
      // submitValidForm() cannot be used since it awaits the click, which waits for the whole submission to complete before returning.
      const clickPromise = ctx.user.click(submitButton)

      const submittingButton = await screen.findByRole('button', {
        name: /submitting\.\.\./i,
      })

      expect(submittingButton).toBeInTheDocument()
      expect(submittingButton.closest('fieldset')).toBeDisabled()

      // Advance fake timers to resolve the delay() in onSubmit, then let the submission complete cleanly
      vi.advanceTimersByTime(ctx.ms)
      await clickPromise
    })

    it('calls onSubmit with correct form data', async () => {
      await submitValidForm(ctx.user)
      vi.advanceTimersByTime(ctx.ms)

      expect(ctx.mockOnSubmit).toHaveBeenCalledWith(validFormData)
    })

    it('shows success screen after valid form submission', async () => {
      await submitValidForm(ctx.user)
      vi.advanceTimersByTime(ctx.ms)

      const { heading, addNewExpenseButton } = await getSuccessScreenElements()
      expect(heading).toBeInTheDocument()
      expect(addNewExpenseButton).toBeInTheDocument()
    })

    it('returns to form when Add New Expense is clicked', async () => {
      await submitValidForm(ctx.user)
      vi.advanceTimersByTime(ctx.ms)

      const { addNewExpenseButton } = await getSuccessScreenElements()
      await ctx.user.click(addNewExpenseButton)

      const { descriptionInput, amountInput, categorySelect } =
        getFormElements()
      expect(descriptionInput).toBeInTheDocument()
      expect(amountInput).toBeInTheDocument()
      expect(categorySelect).toBeInTheDocument()
    })
  })
})
