import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BugReportForm } from '@/components'
import { setupFormSubmission } from '@/__tests__/setup-submission'

type FormData = Parameters<
  NonNullable<React.ComponentProps<typeof BugReportForm>['onSubmit']>
>[0]

const validFormData: FormData = {
  title: 'Valid bug title',
  description:
    'This is a valid description that is long enough to pass validation.',
}
const invalidFormData: FormData = { title: 'ab', description: 'Too short' }

describe('BugReportForm', () => {
  let user: ReturnType<typeof userEvent.setup>

  function getFormElements() {
    return {
      titleInput: screen.getByLabelText(/bug title/i),
      descriptionInput: screen.getByLabelText(/description/i),
      submitButton: screen.getByRole('button', { name: /submit/i }),
      resetButton: screen.getByRole('button', { name: /reset/i }),
    }
  }

  // Non-submission related tests
  describe('form display and validation', () => {
    beforeEach(() => {
      user = userEvent.setup()
      render(<BugReportForm />)
    })

    it('renders form with title field, description field, and action buttons', () => {
      const { titleInput, descriptionInput, submitButton, resetButton } =
        getFormElements()

      expect(titleInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
    })

    it('shows error when title is shorter than 5 characters', async () => {
      const { titleInput } = getFormElements()

      await user.type(titleInput, invalidFormData.title)
      await user.tab()

      expect(
        await screen.findByText(/bug title must be at least 5 characters./i),
      ).toBeInTheDocument()
    })

    it('shows error when title exceeds 32 characters', async () => {
      const { titleInput } = getFormElements()

      await user.click(titleInput)
      await user.paste('a'.repeat(33)) // much faster than user.type() since it fires a single event instead of multiple keyboard cycles
      await user.tab()

      expect(
        await screen.findByText(/bug title must be at most 32 characters./i),
      ).toBeInTheDocument()
    })

    it('shows error when description is shorter than 20 characters', async () => {
      const { descriptionInput } = getFormElements()

      await user.type(descriptionInput, invalidFormData.description)
      await user.tab()

      expect(
        await screen.findByText(/description must be at least 20 characters./i),
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

    it('updates character counter as user types in description', async () => {
      const { descriptionInput } = getFormElements()

      expect(screen.getByText('0/100 characters')).toBeInTheDocument()

      await user.type(descriptionInput, 'Hello')

      expect(screen.getByText('5/100 characters')).toBeInTheDocument()
    })

    it('clears fields when Reset button is clicked', async () => {
      const { titleInput, descriptionInput, resetButton } = getFormElements()

      await user.type(titleInput, 'My bug title')
      await user.type(descriptionInput, 'Some description text here')
      await user.click(resetButton)

      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  // Submission related tests (need fake timers + onSubmit)
  describe('form submission', () => {
    // Registers beforeEach/afterEach hooks and returns a ctx object mutated before each test.
    const ctx = setupFormSubmission<FormData>(BugReportForm)

    async function submitValidForm() {
      const { titleInput, descriptionInput, submitButton } = getFormElements()

      await user.type(titleInput, validFormData.title)
      await user.type(descriptionInput, validFormData.description)
      await user.click(submitButton)
    }

    async function getSuccessScreenElements() {
      const [heading, reportAnotherButton] = await Promise.all([
        screen.findByRole('heading', {
          name: /thank you for your contribution!/i,
        }),
        screen.findByRole('button', {
          name: /report another bug/i,
        }),
      ])
      return { heading, reportAnotherButton }
    }

    it('shows spinner and disables fieldset while submitting', async () => {
      const { titleInput, descriptionInput, submitButton } = getFormElements()

      await ctx.user.type(titleInput, validFormData.title)
      await ctx.user.type(descriptionInput, validFormData.description)

      // Starts submission without awaiting to observe the loading state (fire-and-forget).
      // submitValidForm() cannot be used since it awaits the click, which waits for the whole submission to complete before returning.
      void ctx.user.click(submitButton)

      const submittingButton = await screen.findByRole('button', {
        name: /submitting\.\.\./i,
      })

      expect(submittingButton).toBeInTheDocument()
      expect(submittingButton.closest('fieldset')).toBeDisabled()
    })

    it('calls onSubmit with correct form data', async () => {
      await submitValidForm()
      vi.advanceTimersByTime(ctx.ms)
      expect(ctx.mockOnSubmit).toHaveBeenCalledWith(validFormData)
    })

    it('shows success screen after valid form submission', async () => {
      await submitValidForm()
      vi.advanceTimersByTime(ctx.ms)

      const { heading, reportAnotherButton } = await getSuccessScreenElements()
      expect(heading).toBeInTheDocument()
      expect(reportAnotherButton).toBeInTheDocument()
    })

    it('returns to form when Report Another Bug is clicked', async () => {
      await submitValidForm()
      vi.advanceTimersByTime(ctx.ms)

      const { reportAnotherButton } = await getSuccessScreenElements()
      await user.click(reportAnotherButton)

      const { titleInput, descriptionInput } = getFormElements()
      expect(titleInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()
    })
  })
})
