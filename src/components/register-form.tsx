import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  useForm,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import z from 'zod'

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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  name: z
    .string()
    .min(5, 'Name must be at least 5 characters long.')
    .max(100, 'Name must be at most 100 characters long.'),
  email: z.email('Please enter a valid email address.'),
  age: z.coerce
    .number({ error: 'Age field is required.' })
    .min(18, 'You must be at least 18 years old.')
    .max(120, 'Please enter a valid age.'),
})

type FormInput = {
  name: string
  email: string
  age: number | undefined
}

type FormOutput = z.infer<typeof schema>

const initialFormData: FormInput = {
  name: '',
  email: '',
  age: undefined,
}

interface RegisterFormProps {
  onSubmit?: (data: FormOutput) => Promise<void>
}

function RegisterForm({ onSubmit }: RegisterFormProps) {
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema) as Resolver<FormInput, unknown, FormOutput>,
    defaultValues: initialFormData,
    mode: 'onTouched',
  })

  const submit: SubmitHandler<FormOutput> = async (data) => {
    await onSubmit?.(data)
    form.reset()
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <>
        <Heading as="h2" className="mb-4">
          Thanks for registering!
        </Heading>
        <Button
          variant="outline"
          onClick={() => {
            form.reset()
          }}
        >
          Register Another User
        </Button>
      </>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Registration</CardTitle>
        <CardDescription>
          Please fill out the form below to register. All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(submit)}>
          <FieldSet disabled={form.formState.isSubmitting}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="Your name..."
                      autoComplete="off"
                      className="rounded-sm text-sm"
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby="name-error"
                    />
                    {fieldState.error && (
                      <FieldError id="name-error" className="text-xs">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Your email..."
                      autoComplete="email"
                      className="rounded-sm text-sm"
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby="email-error"
                    />
                    {fieldState.error && (
                      <FieldError id="email-error" className="text-xs">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
              <Controller
                name="age"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="age">Age</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      id="age"
                      type="number"
                      min={0}
                      max={120}
                      placeholder="Your age..."
                      autoComplete="off"
                      className="rounded-sm text-sm"
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby="age-error"
                    />
                    {fieldState.error && (
                      <FieldError id="age-error" className="text-xs">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <Field orientation="responsive">
                <Button
                  type="submit"
                  className="w-fit min-w-24"
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

function RegisterFormSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <Skeleton id="card-title" className="h-5 w-full sm:w-3/12" />
        <div className="space-y-2 min-[480px]:space-y-0">
          <Skeleton
            id="card-description"
            className="h-3 w-full min-[480px]:h-3.5 sm:w-4/5"
          />
          <Skeleton
            id="card-description"
            className="h-3.5 w-1/5 min-[480px]:hidden"
          />
        </div>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <Skeleton id="name-label" className="h-5 w-1/5!" />
              <Skeleton id="name-input" className="h-9 w-full" />
            </Field>

            <Field>
              <Skeleton id="email-label" className="h-5 w-1/5!" />
              <Skeleton id="email-input" className="h-9 w-full" />
            </Field>

            <Field>
              <Skeleton id="age-label" className="h-5 w-1/5!" />
              <Skeleton id="age-input" className="h-9 w-full" />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field orientation="responsive">
              <Skeleton id="submit-button" className="h-9 min-w-24" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
export { RegisterFormSkeleton }
