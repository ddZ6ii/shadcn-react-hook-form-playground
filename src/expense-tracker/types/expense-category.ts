const categories = ['groceries', 'utilities', 'entertainment'] as const

type Category = (typeof categories)[number]

export { categories, type Category }
