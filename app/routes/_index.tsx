import { createId } from '@paralleldrive/cuid2'
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useRouteError,
  useSubmit
} from '@remix-run/react'
import { json, type ActionArgs, type V2_MetaFunction } from '@vercel/remix'
import { Label } from 'app/components/ui/label'
import { type FormEvent, useState, useRef, useEffect } from 'react'
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
import { Textarea } from '~/components/ui/textarea'
import { db } from '~/lib/db/init'
import type { InsertHouseholdsAreasAndChores } from '~/lib/db/schema'
import {
  areas,
  areasToChores,
  chores,
  households,
  insertHouseholdsAreasAndChoresSchema
} from '~/lib/db/schema'

export const meta: V2_MetaFunction = () => [{ title: 'New Remix App' }]

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const fields = Object.fromEntries(formData.entries())

  fields.areas = JSON.parse(fields.areas as string)
  fields.chores = JSON.parse(fields.chores as string)

  const result = insertHouseholdsAreasAndChoresSchema.safeParse(fields)

  if (!result.success) {
    return json({ error: result.error.flatten(), fields }, { status: 400 })
  }

  const { areas: inputAreas, chores: inputChores, householdName } = result.data

  const areasDictionary = Object.keys(inputAreas).reduce((acc, area) => {
    acc[area] = createId()
    return acc
  }, {} as Record<string, string>)

  const choresDictionary = inputChores.reduce((acc, chore) => {
    if (chore.name) {
      acc[chore.name] = createId()
    }
    return acc
  }, {} as Record<string, string>)

  const householdId = createId()
  const newHousehold = await db
    .insert(households)
    .values({ name: householdName, id: householdId })
    .returning()

  if (!newHousehold || newHousehold.length === 0) {
    throw new Error('Could not create household')
  }

  const areasToInsert = Object.entries(areasDictionary).map(
    ([areaName, id]) => {
      return {
        id,
        name: areaName,
        householdId
      }
    }
  )

  if (areasToInsert.length) {
    const newAreas = await db.insert(areas).values(areasToInsert).returning()

    if (!newAreas || newAreas.length === 0) {
      throw new Error('Could not create areas')
    }
  }

  const choresToInsert = Object.entries(choresDictionary).map(
    ([choreName, id]) => {
      return {
        id,
        name: choreName
      }
    }
  )

  if (choresToInsert.length) {
    const newChores = await db.insert(chores).values(choresToInsert).returning()

    if (!newChores || newChores.length === 0) {
      throw new Error('Could not create chores')
    }
  }

  const areasToChoresInput: Record<string, string>[] = []

  Object.entries(inputAreas).forEach(([areaName, chores]) => {
    chores.forEach((chore) => {
      areasToChoresInput.push({
        // id: createId(),
        areaId: areasDictionary[areaName],
        choreId: choresDictionary[chore]
      })
    })
  })

  if (areasToChoresInput.length) {
    const newAreasToChores = await db
      .insert(areasToChores)
      .values(areasToChoresInput)
      .returning()

    if (!newAreasToChores || newAreasToChores.length === 0) {
      throw new Error('Could not create areas to chores')
    }
  }

  return json({ succes: 'ok' })
}

type Step = 'household' | 'areas' | 'chores' | 'check'

export default function Index() {
  const form = useActionData<typeof action>()
  const submit = useSubmit()
  const [step, setStep] = useState<Step>('household')
  const [inputs, setInputs] = useState({
    householdName: '',
    areaName: '',
    choreName: '',
    choreDescription: ''
  })
  const [chores, setChores] = useState<{ description: string; name: string }[]>(
    []
  )
  const householdRef = useRef<HTMLInputElement | null>(null)
  const areaRef = useRef<HTMLInputElement | null>(null)
  const choreRef = useRef<HTMLInputElement | null>(null)

  const [formValues, setFormValues] = useState<InsertHouseholdsAreasAndChores>({
    areas: {},
    chores: [],
    householdName: ''
  })

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append('householdName', inputs.householdName)
    formData.append('chores', JSON.stringify(formValues.chores))
    formData.append('areas', JSON.stringify(formValues.areas))

    submit(formData, { method: 'POST' })
  }

  const handleChange = (
    e: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget
    setInputs((state) => ({ ...state, [name]: value }))
  }

  const handleNextStep = (step: Step) => {
    setStep(step)
  }

  const handleGoToAreas = () => {
    setFormValues((state) => ({
      ...state,
      householdName: inputs.householdName
    }))

    setStep('areas')

    setTimeout(() => areaRef.current?.focus())
  }

  const handleAddAnotherArea = () => {
    setFormValues((state) => ({
      ...state,
      areas: {
        ...state.areas,
        [inputs.areaName]: []
      }
    }))

    setInputs((state) => ({ ...state, areaName: '' }))

    setTimeout(() => areaRef.current?.focus())
  }

  const handleGoToChores = () => {
    setStep('chores')

    setFormValues((state) => ({
      ...state,
      areas: {
        ...state.areas,
        [inputs.areaName]: []
      }
    }))

    setTimeout(() => choreRef.current?.focus())
  }

  const handleAddAnotherChore = () => {
    setChores((state) => [
      ...state,
      { name: inputs.choreName, description: inputs.choreDescription }
    ])
    setFormValues((state) => ({
      ...state,
      areas: {
        ...state.areas,
        [inputs.areaName]: [...state.areas[inputs.areaName], inputs.choreName]
      },
      chores: [
        ...chores,
        { name: inputs.choreName, description: inputs.choreDescription }
      ]
    }))
    setInputs((state) => ({ ...state, choreName: '', choreDescription: '' }))
    setTimeout(() => choreRef.current?.focus())
  }

  const handleGoToAreasFromChores = () => {
    setFormValues((state) => ({
      ...state,
      chores: [
        ...state.chores,
        { name: inputs.choreName, description: inputs.choreDescription }
      ],
      areas: {
        ...state.areas,
        [inputs.areaName]: [...state.areas[inputs.areaName], inputs.choreName]
      }
    }))
    setInputs((state) => ({
      ...state,
      choreName: '',
      choreDescription: '',
      areaName: ''
    }))
    setStep('areas')
    setTimeout(() => areaRef.current?.focus())
  }

  const handleGoToCheck = () => {
    setFormValues((state) => ({
      ...state,
      chores:
        inputs.choreName && inputs.choreDescription
          ? [
              ...state.chores,
              { name: inputs.choreName, description: inputs.choreDescription }
            ]
          : inputs.choreName
          ? [...state.chores, { name: inputs.choreName }]
          : [...state.chores],
      areas: {
        ...state.areas,
        [inputs.areaName]: inputs.choreName
          ? [...state.areas[inputs.areaName], inputs.choreName]
          : [...state.areas[inputs.areaName]]
      }
    }))
    setInputs((state) => ({
      ...state,
      choreName: '',
      choreDescription: '',
      areaName: ''
    }))
    handleNextStep('check')
  }

  useEffect(() => {
    householdRef.current?.focus()
  }, [inputs.householdName, inputs.areaName])

  useEffect(() => {
    console.log(formValues)
  }, [formValues])

  return (
    <Form className='h-full grid place-items-center w-11/12 mx-auto max-w-sm'>
      <Card className='w-full'>
        <CardHeader>
          <div className='flex justify-center flex-col items-center gap-2'>
            <div className='text-center'>
              <CardTitle>Welcome to</CardTitle>
              <CardTitle>Chore Champ</CardTitle>
            </div>
            <span className='text-3xl'>💪</span>
          </div>

          <CardDescription>
            {step === 'household'
              ? 'What is the name of your household?'
              : step === 'areas'
              ? 'Which areas would you like to keep track of?'
              : step === 'chores'
              ? 'Which chores would you like to assign to this area?'
              : step === 'check'
              ? 'How does this look?'
              : 'no step yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'household' ? (
            <div>
              <div className='grid w-full items-center gap-4'>
                <div className='flex flex-col space-y-1.5'>
                  <Label htmlFor='householdName'>Household Name</Label>
                  <Input
                    value={inputs.householdName}
                    onChange={handleChange}
                    name='householdName'
                    id='householdName'
                    placeholder="Barbie's dream house"
                    ref={householdRef}
                  />
                </div>
              </div>
            </div>
          ) : step === 'areas' ? (
            <div>
              <div className='grid w-full items-center gap-4'>
                <div className='flex flex-col space-y-1.5'>
                  <CardTitle>Your Household</CardTitle>
                  <CardDescription>{inputs.householdName}</CardDescription>
                </div>
                <div className='flex flex-col space-y-1.5'>
                  <Label htmlFor='areaName'>Area name</Label>
                  <Input
                    value={inputs.areaName}
                    onChange={handleChange}
                    name='areaName'
                    id='areaName'
                    placeholder='Throne Room aka Bathroom'
                    ref={areaRef}
                  />
                </div>
              </div>
            </div>
          ) : step === 'chores' ? (
            <div>
              <div className='grid w-full items-center gap-4'>
                <div className='flex flex-col space-y-1.5'>
                  <CardTitle>Your Household</CardTitle>
                  <CardDescription>{inputs.householdName}</CardDescription>
                </div>

                <div className='flex flex-col space-y-1.5'>
                  <CardTitle>Area name</CardTitle>
                  <CardDescription>{inputs.areaName}</CardDescription>
                </div>

                {chores.length > 0 && (
                  <div className='flex flex-col space-y-1.5'>
                    <CardTitle>Chores assigned to this area</CardTitle>
                    {chores.map((chore) => (
                      <CardDescription key={chore.name}>
                        {chore.name}
                      </CardDescription>
                    ))}
                  </div>
                )}

                <div className='flex flex-col space-y-1.5'>
                  <Label htmlFor='choreName'>New chore name</Label>
                  <Input
                    value={inputs.choreName}
                    onChange={handleChange}
                    name='choreName'
                    id='choreName'
                    placeholder='Dust'
                    ref={choreRef}
                  />
                </div>

                <div className='grid w-full gap-1.5'>
                  <Label htmlFor='choreDescription'>New note</Label>
                  <Textarea
                    disabled={!inputs.choreName}
                    value={inputs.choreDescription}
                    onChange={handleChange}
                    name='choreDescription'
                    id='choreDescription'
                    placeholder='Don’t forget to dust the ceiling fan!'
                    className='resize-none'
                  />
                </div>
              </div>
            </div>
          ) : step === 'check' ? (
            <div>
              <div className='grid w-full items-center gap-4'>
                <div className='flex flex-col space-y-1.5'>
                  <CardTitle>Your Household</CardTitle>
                  <CardDescription>{inputs.householdName}</CardDescription>
                </div>
                <div className='flex flex-col space-y-1.5'>
                  <CardTitle>Areas with assigned chores</CardTitle>
                  <div className='grid grid-flow-col'>
                    {Object.entries(formValues.areas).map(([area, chores]) => (
                      <div key={area}>
                        <p className='font-medium text-sm'>{area}</p>
                        <div className='grid gap-1.5'>
                          {chores.map((chore) => (
                            <CardDescription key={chore}>
                              {chore}
                            </CardDescription>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className=''>no step yet</div>
          )}
        </CardContent>

        {step === 'household' ? (
          <CardFooter className='flex justify-end'>
            <Button
              disabled={inputs.householdName.length === 0}
              onClick={handleGoToAreas}
            >
              Next
            </Button>
          </CardFooter>
        ) : step === 'areas' ? (
          <CardFooter className='grid grid-cols-2 gap-2'>
            <Button
              disabled={inputs.areaName.length === 0}
              onClick={handleAddAnotherArea}
              variant='ghost'
            >
              Add another area
            </Button>
            <Button
              disabled={inputs.areaName.length === 0}
              onClick={handleGoToChores}
            >
              Next
            </Button>
          </CardFooter>
        ) : step === 'chores' ? (
          <CardFooter className='grid grid-cols-2 gap-2'>
            <Button
              disabled={inputs.choreName.length === 0}
              onClick={handleAddAnotherChore}
              variant='ghost'
            >
              Another chore
            </Button>
            <Button onClick={handleGoToAreasFromChores} variant='secondary'>
              Another area
            </Button>
            <Button className='col-span-2' onClick={handleGoToCheck}>
              Check
            </Button>
          </CardFooter>
        ) : step === 'check' ? (
          <CardFooter className='flex justify-end'>
            <Button onClick={handleSubmit}>Done</Button>
          </CardFooter>
        ) : (
          <div>no step yet</div>
        )}
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
