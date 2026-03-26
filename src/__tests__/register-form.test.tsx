import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'

import { RegisterForm } from '@/components'

describe('RegisterForm', () => {
  let user: ReturnType<typeof userEvent.setup>

  async function submitValidForm() {
    await user.type(screen.getByLabelText('Name'), 'Valid name')
    await user.type(screen.getByLabelText('Email'), 'valid@example.com')
    await user.type(screen.getByLabelText('Age'), '25')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
  }

  beforeEach(() => {
    user = userEvent.setup()
    render(<RegisterForm />)
  })

  it('renders form with name field, email field, age field, and submit button', () => {
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('shows error when name is shorter than 5 characters', async () => {
    await user.type(screen.getByLabelText('Name'), 'ab')
    await user.tab()

    expect(
      await screen.findByText('Name must be at least 5 characters long.'),
    ).toBeInTheDocument()
  })

  it('shows error when name exceeds 100 characters', async () => {
    await user.type(screen.getByLabelText('Name'), 'a'.repeat(101))
    await user.tab()

    expect(
      await screen.findByText('Name must be at most 100 characters long.'),
    ).toBeInTheDocument()
  })

  it('shows error when email is not valid', async () => {
    await user.type(screen.getByLabelText('Email'), 'invalid-email')
    await user.tab()

    expect(
      await screen.findByText('Please enter a valid email address.'),
    ).toBeInTheDocument()
  })

  it('shows error when age is less than 18', async () => {
    await user.type(screen.getByLabelText('Age'), '17')
    await user.tab()

    expect(
      await screen.findByText('You must be at least 18 years old.'),
    ).toBeInTheDocument()
  })

  it('shows error when age is greater than 120', async () => {
    await user.type(screen.getByLabelText('Age'), '121')
    await user.tab()

    expect(
      await screen.findByText('Please enter a valid age.'),
    ).toBeInTheDocument()
  })

  it('shows spinner and disables fieldset while submitting', async () => {
    await user.type(screen.getByLabelText('Name'), 'Valid name')
    await user.type(screen.getByLabelText('Email'), 'valid@example.com')
    await user.type(screen.getByLabelText('Age'), '25')

    void user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('Submitting...')).toBeInTheDocument()
    expect(screen.getByText('Submitting...').closest('fieldset')).toBeDisabled()
  })

  it('shows success screen after valid form submission', async () => {
    await submitValidForm()

    expect(
      await screen.findByRole(
        'heading',
        { name: /thanks for registering!/i },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /register another user/i }),
    ).toBeInTheDocument()
  })

  it('returns to form when Register another user is clicked', async () => {
    await submitValidForm()

    const buttonEl = await screen.findByRole(
      'button',
      { name: /register another user/i },
      { timeout: 3000 },
    )
    await user.click(buttonEl)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })
})
