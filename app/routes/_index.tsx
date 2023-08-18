import { createId } from '@paralleldrive/cuid2'
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useRouteError
} from '@remix-run/react'
import { json, type ActionArgs, type V2_MetaFunction } from '@vercel/remix'
import { Label } from 'app/components/ui/label'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { db } from '~/lib/db/init'
import { areas, areasToChores, chores, households } from '~/lib/db/schema'

export const meta: V2_MetaFunction = () => [{ title: 'New Remix App' }]

export async function action({ request }: ActionArgs) {
  // const formData = await request.formData()
  // const data = insertHouseholdAreaAndChoreSchema.parse(
  //   Object.fromEntries(formData.entries())
  // )

  const householdName = 'My Household'
  const allChores = [
    'dishes',
    'sweep',
    'mop',
    'toilet',
    'sink',
    'shower',
    'mop',
    'sweep'
  ]
  const areasToEnter = {
    kitchen: ['dishes', 'sweep', 'mop'],
    bathroom: ['toilet', 'sink', 'shower', 'mop', 'sweep']
  }

  const areasDictionary = Object.keys(areasToEnter).reduce((acc, area) => {
    acc[area] = { id: createId(), name: area }
    return acc
  }, {} as Record<string, { id: string; name: string }>)

  const choresDictionary = allChores.reduce((acc, chore) => {
    acc[chore] = { id: createId(), name: chore }
    return acc
  }, {} as Record<string, { id: string; name: string }>)

  const householdId = createId()
  const newHousehold = await db
    .insert(households)
    .values({ name: householdName, id: householdId })
    .returning()

  if (!newHousehold || newHousehold.length === 0) {
    throw new Error('Could not create household')
  }

  // const areaIds = data.areaNames.map((name) => ({ id: createId(), name }))
  const areasToInsert = Object.entries(areasDictionary).map(
    ([areaName, area]) => {
      return {
        id: area.id,
        name: areaName,
        householdId
      }
    }
  )

  const newAreas = await db.insert(areas).values(areasToInsert).returning()

  if (!newAreas || newAreas.length === 0) {
    throw new Error('Could not create areas')
  }

  const choresToInsert = Object.entries(choresDictionary).map(
    ([choreName, chore]) => {
      return {
        id: chore.id,
        name: choreName
      }
    }
  )
  const newChores = await db.insert(chores).values(choresToInsert).returning()

  if (!newChores || newChores.length === 0) {
    throw new Error('Could not create chores')
  }

  const areasToChoresInput: Record<string, string>[] = []

  Object.entries(areasToEnter).forEach(([areaName, chores]) => {
    chores.forEach((chore) => {
      areasToChoresInput.push({
        // id: createId(),
        areaId: areasDictionary[areaName].id,
        choreId: choresDictionary[chore].id
      })
    })
  })

  const newAreasToChores = await db
    .insert(areasToChores)
    .values(areasToChoresInput)
    .returning()

  if (!newAreasToChores || newAreasToChores.length === 0) {
    throw new Error('Could not create areas to chores')
  }

  return json({ succes: 'ok' })
}

export default function Index() {
  const form = useActionData()

  console.log('form', form)

  return (
    <Form className='h-full grid place-items-center' method='post'>
      <Card className=''>
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className='grid w-full items-center gap-4'>
              <div className='flex flex-col space-y-1.5'>
                <Label htmlFor='name'>Name</Label>
                <Input id='name' placeholder='Name of your project' />
              </div>
              <div className='flex flex-col space-y-1.5'>
                <Label htmlFor='framework'>Framework</Label>
                <Select>
                  <SelectTrigger id='framework'>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent position='popper'>
                    <SelectItem value='next'>Next.js</SelectItem>
                    <SelectItem value='sveltekit'>SvelteKit</SelectItem>
                    <SelectItem value='astro'>Astro</SelectItem>
                    <SelectItem value='nuxt'>Nuxt.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button variant='outline'>Cancel</Button>
          <Button type='submit'>Deploy</Button>
        </CardFooter>
      </Card>
    </Form>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}
