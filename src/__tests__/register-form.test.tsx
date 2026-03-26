import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/components'
import { setupFormSubmission } from '@/__tests__/setup-submission'

type FormData = Parameters<
  NonNullable<React.ComponentProps<typeof RegisterForm>['onSubmit']>
>[0]

const validFormData: FormData = {
  name: 'Valid name',
  email: 'valid@example.com',
  age: 25,
}
const invalidFormData: FormData = {
  name: 'ab',
  email: 'invalid-email',
  age: 17,
}

describe('RegisterForm', () => {
  let user: ReturnType<typeof userEvent.setup>

  function getFormElements() {
    return {
      nameInput: screen.getByLabelText(/name/i),
      emailInput: screen.getByLabelText(/email/i),
      ageInput: screen.getByLabelText(/age/i),
      submitButton: screen.getByRole('button', { name: /submit/i }),
    }
  }

  // Non-submission related tests
  describe('form display and validation', () => {
    beforeEach(() => {
      user = userEvent.setup()
      render(<RegisterForm />)
    })

    it('renders form with name field, email field, age field, and submit button', () => {
      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()

      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(ageInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })

    it('shows error when name is shorter than 5 characters', async () => {
      const { nameInput } = getFormElements()

      await user.type(nameInput, invalidFormData.name)
      await user.tab()

      expect(
        await screen.findByText(/name must be at least 5 characters long./i),
      ).toBeInTheDocument()
    })

    it('shows error when name exceeds 100 characters', async () => {
      const { nameInput } = getFormElements()

      await user.click(nameInput)
      await user.paste('a'.repeat(101)) // much faster than user.type() since it fires a single event instead of multiple keyboard cycles
      await user.tab()

      expect(
        await screen.findByText(/name must be at most 100 characters long./i),
      ).toBeInTheDocument()
    })

    it('shows error when email is not valid', async () => {
      const { emailInput } = getFormElements()

      await user.type(emailInput, invalidFormData.email)
      await user.tab()

      expect(
        await screen.findByText(/please enter a valid email address./i),
      ).toBeInTheDocument()
    })

    it('shows error when age is less than 18', async () => {
      const { ageInput } = getFormElements()

      await user.type(ageInput, invalidFormData.age.toString())
      await user.tab()

      expect(
        await screen.findByText(/you must be at least 18 years old./i),
      ).toBeInTheDocument()
    })

    it('shows error when age is greater than 120', async () => {
      const { ageInput } = getFormElements()

      await user.type(ageInput, '121')
      await user.tab()

      expect(
        await screen.findByText(/please enter a valid age./i),
      ).toBeInTheDocument()
    })
  })

  // Submission related tests (need fake timers + onSubmit)
  describe('form submission', () => {
    // Registers beforeEach/afterEach hooks and returns a ctx object mutated before each test.
    const ctx = setupFormSubmission<FormData>(RegisterForm)

    async function getSuccessScreenElements() {
      const [heading, registerAnotherUserButton] = await Promise.all([
        screen.findByRole('heading', {
          name: /thanks for registering!/i,
        }),
        screen.findByRole('button', {
          name: /register another user/i,
        }),
      ])

      return { heading, registerAnotherUserButton }
    }

    async function submitValidForm() {
      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()

      await user.type(nameInput, validFormData.name)
      await user.type(emailInput, validFormData.email)
      await user.type(ageInput, validFormData.age.toString())
      await user.click(submitButton)
    }

    it('shows spinner and disables fieldset while submitting', async () => {
      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()

      await ctx.user.type(nameInput, validFormData.name)
      await ctx.user.type(emailInput, validFormData.email)
      await ctx.user.type(ageInput, validFormData.age.toString())

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

      const { heading, registerAnotherUserButton } =
        await getSuccessScreenElements()

      expect(heading).toBeInTheDocument()
      expect(registerAnotherUserButton).toBeInTheDocument()
    })

    it('returns to form when Register another user is clicked', async () => {
      await submitValidForm()
      vi.advanceTimersByTime(ctx.ms)

      const { registerAnotherUserButton } = await getSuccessScreenElements()
      await user.click(registerAnotherUserButton)

      const { nameInput, emailInput, ageInput, submitButton } =
        getFormElements()
      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(ageInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })
})
