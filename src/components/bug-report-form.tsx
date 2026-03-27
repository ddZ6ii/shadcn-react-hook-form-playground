import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'

const schema = z
  .object({
    title: z
      .string()
      .min(5, 'Bug title must be at least 5 characters.')
      .max(32, 'Bug title must be at most 32 characters.'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters.')
      .max(100, 'Description must be at most 100 characters.'),
  })
  .required()

type FormData = z.infer<typeof schema>

const initialFormData: FormData = {
  title: '',
  description: '',
}

interface BugReportFormProps {
  onSubmit?: (data: FormData) => Promise<void>
}

function BugReportForm({ onSubmit }: BugReportFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialFormData,
    mode: 'onTouched',
  })

  const submit: SubmitHandler<FormData> = async (data) => {
    await onSubmit?.(data)
    form.reset()
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <>
        <Heading as="h2" className="mb-4">
          Thank you for your contribution!
        </Heading>
        <Button
          variant="outline"
          onClick={() => {
            form.reset()
          }}
        >
          Report Another Bug
        </Button>
      </>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>
        <CardDescription>
          Help us improve by reporting bugs you encounter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(submit)}>
          <FieldSet disabled={form.formState.isSubmitting}>
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="title">Bug Title</FieldLabel>
                    <Input
                      {...field}
                      id="title"
                      type="text"
                      className="text-sm"
                      placeholder="Login button not working on mobile..."
                      autoComplete="off"
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby="title-error"
                    />
                    {fieldState.invalid && (
                      <FieldError id="title-error" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="description"
                        placeholder="I'm having an issue with the login button on mobile..."
                        rows={6}
                        className="min-h-32 resize-none pb-8 text-sm"
                        required
                        aria-invalid={fieldState.invalid}
                        aria-describedby="description-count description-error"
                      />
                      <InputGroupAddon
                        id="description-count"
                        align="block-end"
                        className="text-muted-foreground"
                        aria-live="polite"
                      >
                        {field.value.length}/100 characters
                      </InputGroupAddon>
                    </InputGroup>

                    <FieldDescription>
                      Include steps to reproduce, expected behavior, and what
                      actually happened.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError id="description-error" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <Field orientation="responsive">
                <Button
                  type="button"
                  className="w-fit min-w-24"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                  }}
                >
                  Reset
                </Button>
                <Button
                  className="w-fit min-w-24"
                  type="submit"
                  disabled={!form.formState.isValid}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Spinner aria-hidden="true" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  )
}

export default BugReportForm
