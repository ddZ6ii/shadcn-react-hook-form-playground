import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'

import { BugReportForm } from '@/components'

describe('BugReportForm', () => {
  let user: ReturnType<typeof userEvent.setup>

  async function submitValidForm() {
    await user.type(screen.getByLabelText('Bug Title'), 'Valid bug title')
    await user.type(
      screen.getByLabelText('Description'),
      'This is a valid description that is long enough to pass validation.',
    )
    await user.click(screen.getByRole('button', { name: 'Submit' }))
  }

  beforeEach(() => {
    user = userEvent.setup()
    render(<BugReportForm />)
  })

  it('renders form with title field, description field, and action buttons', () => {
    expect(screen.getByLabelText('Bug Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('shows error when title is shorter than 5 characters', async () => {
    await user.type(screen.getByLabelText('Bug Title'), 'ab')
    await user.tab()

    expect(
      await screen.findByText('Bug title must be at least 5 characters.'),
    ).toBeInTheDocument()
  })

  it('shows error when title exceeds 32 characters', async () => {
    await user.type(screen.getByLabelText('Bug Title'), 'a'.repeat(33))
    await user.tab()

    expect(
      await screen.findByText('Bug title must be at most 32 characters.'),
    ).toBeInTheDocument()
  })

  it('shows error when description is shorter than 20 characters', async () => {
    await user.type(screen.getByLabelText('Description'), 'Too short')
    await user.tab()

    expect(
      await screen.findByText('Description must be at least 20 characters.'),
    ).toBeInTheDocument()
  })

  it('shows error when description exceeds 100 characters', async () => {
    await user.type(screen.getByLabelText('Description'), 'a'.repeat(101))
    await user.tab()

    expect(
      await screen.findByText('Description must be at most 100 characters.'),
    ).toBeInTheDocument()
  })

  it('updates character counter as user types in description', async () => {
    expect(screen.getByText('0/100 characters')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Description'), 'Hello')

    expect(screen.getByText('5/100 characters')).toBeInTheDocument()
  })

  it('clears fields when Reset button is clicked', async () => {
    await user.type(screen.getByLabelText('Bug Title'), 'My bug title')
    await user.type(
      screen.getByLabelText('Description'),
      'Some description text here',
    )

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByLabelText('Bug Title')).toHaveValue('')
    expect(screen.getByLabelText('Description')).toHaveValue('')
  })

  it('shows spinner and disables fieldset while submitting', async () => {
    await user.type(screen.getByLabelText('Bug Title'), 'Valid bug title')
    await user.type(
      screen.getByLabelText('Description'),
      'This is a valid description that is long enough to pass validation.',
    )

    // Start submission without awaiting so we can observe the loading state
    void user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('Submitting...')).toBeInTheDocument()
    expect(screen.getByText('Submitting...').closest('fieldset')).toBeDisabled()
  })

  it('shows success screen after valid form submission', async () => {
    await submitValidForm()

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Thank you for your contribution!' },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Report Another Bug' }),
    ).toBeInTheDocument()
  }, 10000)

  it('returns to form when Report Another Bug is clicked', async () => {
    await submitValidForm()
    await screen.findByRole(
      'heading',
      { name: 'Thank you for your contribution!' },
      { timeout: 3000 },
    )
    await user.click(screen.getByRole('button', { name: 'Report Another Bug' }))

    expect(screen.getByLabelText('Bug Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  }, 10000)
})
