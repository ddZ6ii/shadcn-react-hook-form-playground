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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { categories, type Category } from '@/types'

const schema = z.object({
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters.')
    .max(100, 'Description must be at most 100 characters.'),
  amount: z.coerce
    .number({ error: 'Amount field is required.' })
    .positive('Amount must greater than 0.')
    .min(0.01, 'Amount must be at least 0.01.')
    .max(1000000, 'Amount must be less than 1,000,000.'),
  category: z.literal(categories, { error: 'A category is required.' }),
})

type FormInput = Pick<FormData, 'description'> & {
  amount: number | undefined
  category: Category | undefined
}
type FormData = z.infer<typeof schema>

const initialFormData: FormInput = {
  description: '',
  amount: undefined,
  category: undefined,
}

interface ExpenseTrackerFormProps {
  onSubmit?: (data: FormData) => Promise<void>
}

function ExpenseTrackerForm({ onSubmit }: ExpenseTrackerFormProps) {
  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema) as Resolver<FormInput, unknown, FormData>,
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
          Your new expense has been added successfully!
        </Heading>
        <Button
          variant="outline"
          onClick={() => {
            form.reset()
          }}
        >
          Add a new expense
        </Button>
      </>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Expense Tracker</CardTitle>
        <CardDescription>
          Fill out the form below to add an expense.
          <br />
          All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          aria-label="Expense Tracker"
          onSubmit={form.handleSubmit(submit)}
        >
          <FieldSet disabled={form.formState.isSubmitting}>
            <FieldGroup>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Input
                      {...field}
                      id="description"
                      type="text"
                      className="text-sm"
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby="description-error"
                    />
                    {fieldState.error && (
                      <FieldError id="description-error">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="amount">Amount</FieldLabel>
                    <Input
                      {...field}
                      id="amount"
                      type="number"
                      className="text-sm"
                      required
                      value={field.value ?? ''}
                      aria-invalid={fieldState.invalid}
                      aria-describedby="amount-error"
                    />
                    {fieldState.error && (
                      <FieldError id="amount-error">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="category"
                        data-testid="select-trigger-category"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        aria-required
                        aria-describedby="category-error"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError id="category-error">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="submit" disabled={!form.formState.isValid}>
              {form.formState.isSubmitting ? (
                <>
                  <Spinner aria-hidden="true" />
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  )
}

function ExpenseTrackerSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <Skeleton id="card-title" className="h-5 w-full sm:w-3/12" />
        <div className="space-y-2 min-[345px]:space-y-1">
          <Skeleton
            id="card-description"
            className="h-3 w-full min-[345px]:h-3.5 sm:w-4/5"
          />
          <Skeleton
            id="card-description"
            className="h-3 w-full min-[345px]:h-3 sm:w-2/5"
          />
          <Skeleton
            id="card-description"
            className="h-3 w-1/5 min-[345px]:hidden"
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

export default ExpenseTrackerForm
export { ExpenseTrackerSkeleton }
