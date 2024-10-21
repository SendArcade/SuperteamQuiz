'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { useWallet } from "@solana/wallet-adapter-react"
import { useToast } from "@/hooks/use-toast"
import { Miniblink, useAction } from '@dialectlabs/blinks'
import { useActionSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana'
import { BaseBlinkLayoutProps } from '@dialectlabs/blinks-core'
import Blink from '@/components/blink'

interface Option {
  number: number
  text: string
}

interface Question {
  number: number
  question: string
  options: Option[]
  correctOption?: number
}

interface Quiz {
  _id?: string
  address: string
  questions: Question[]
  pricePerQuestion?: string
}

const ACTION_URL = "https://2d77-49-237-46-148.ngrok-free.app"

const CustomLayout: React.FC<BaseBlinkLayoutProps & {
  pricePerQuestion: string
  setPricePerQuestion: React.Dispatch<React.SetStateAction<string>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  saveQuiz: (paymentDone: boolean) => Promise<void>
}> = (props) => {
  const { action, executeFn, pricePerQuestion, setPricePerQuestion, loading, setLoading, saveQuiz } = props

  const [inputValue, setInputValue] = useState(pricePerQuestion)

  const handleExecute = async () => {
    if (props.component) {
      setLoading(true)
      try {
        setPricePerQuestion(inputValue)
        const miniblink_response = await executeFn(props.component, { amount: pricePerQuestion })
        console.log('Miniblink response:', miniblink_response)

        await saveQuiz(true)
      } catch (error) {
        console.error('Execution error:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBlur = () => {
    setPricePerQuestion(inputValue)
  }

  return (
    <>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Price per Question (SOL)"
        className="w-1/4"
      />
      <Button
        onClick={handleExecute}
        disabled={loading}
        className="w-auto px-6"
      >
        {loading ? 'Loading...' : 'Pay'}
      </Button>
    </>
  )
}

export default function Home() {
  const { publicKey } = useWallet()
  const walletAddress = publicKey ? publicKey.toBase58() : null

  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const { adapter } = useActionSolanaWalletAdapter(`${process.env.NEXT_PUBLIC_HELIUS_RPC}`)
  const { action, isLoading: isActionLoading } = useAction({
    url: 'https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fpayment-mini-blink-435887166123.asia-south1.run.app%2Fapi%2Factions%2Fsoltransfer%3Faddress%3DDqbsg8NTpACV32autpnmrCFeidf4AmHSGg6Duia5FBcr&cluster=mainnet',
    adapter
  })

  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal')
  const [updateOrientation, setUpdateOrientation] = useState<'vertical' | 'horizontal'>('horizontal')

  useEffect(() => {
    const checkOrientation = () => {
      const newOrientation = window.innerWidth < 640 ? 'vertical' : 'horizontal'
      setOrientation(newOrientation)
      const newOrientation2 = window.innerWidth < 800 ? 'vertical' : 'horizontal'
      setUpdateOrientation(newOrientation2)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  const [questions, setQuestions] = useState<Question[]>([
    {
      number: 1,
      question: '',
      options: [
        { number: 1, text: '' },
        { number: 2, text: '' },
        { number: 3, text: '' },
        { number: 4, text: '' }
      ]
    }
  ])

  const [questionCounter, setQuestionCounter] = useState(2)
  const [pricePerQuestion, setPricePerQuestion] = useState('')

  const [quizId, setQuizId] = useState<string | null>(null)

  const [blinkVersion, setBlinkVersion] = useState(0)

  const addQuestion = () => {
    const newQuestion: Question = {
      number: questionCounter,
      question: '',
      options: [
        { number: 1, text: '' },
        { number: 2, text: '' },
        { number: 3, text: '' },
        { number: 4, text: '' }
      ]
    }
    setQuestions([...questions, newQuestion])
    setQuestionCounter(questionCounter + 1)
  }

  const removeQuestion = (questionIndex: number) => {
    setQuestions(questions.filter((_, index) => index !== questionIndex))
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const newQuestions = [...questions]
    let questionToUpdate = newQuestions[index]

    if (questionToUpdate) {
      if (field === 'question') {
        questionToUpdate[field] = value as string
      }
      setQuestions(newQuestions)
    }
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    let questionToUpdate = newQuestions[questionIndex]

    if (questionToUpdate) {
      questionToUpdate.options[optionIndex].text = value
      setQuestions(newQuestions)
    }
  }

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions]
    const questionToUpdate = newQuestions[questionIndex]

    if (questionToUpdate.options.length >= 8) return

    const newOption: Option = {
      number: questionToUpdate.options.length + 1,
      text: ''
    }
    questionToUpdate.options.push(newOption)
    setQuestions(newQuestions)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions]
    const questionToUpdate = newQuestions[questionIndex]
    questionToUpdate.options = questionToUpdate.options.filter((_, idx) => idx !== optionIndex)
    setQuestions(newQuestions)
  }

  const updateCorrectOption = (questionIndex: number, optionNumber: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].correctOption = optionNumber
    setQuestions(newQuestions)
  }

  const fetchQuiz = async () => {
    if (!walletAddress) return

    setLoading(true)
    try {
      const response = await fetch(`/api/quiz/fetch?address=${walletAddress}`)
      if (!response.ok) {
        throw new Error("Failed to fetch quiz")
      }

      const data = await response.json()

      if (response.status === 200 && data.message === 'No quiz exists for this address') {
        return
      }

      if (data && data.questions) {
        // Set the fetched questions in the existing state
        setQuestions(data.questions)
        setQuizId(data._id)

        // Update the questionCounter based on the number of fetched questions
        setQuestionCounter(data.questions.length + 1) // Assuming question numbers are sequential

        toast({
          title: "Quiz Loaded",
          description: "Fetched the latest quiz for your wallet.",
          variant: "default"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuiz()
  }, [walletAddress, toast])

  const saveQuiz = async (paymentDone: boolean) => {
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "No wallet connected",
        variant: "destructive"
      })
      return
    }
  
    setLoading(true) // Set loading state when request starts
  
    try {
      // Filter out empty questions and options
      const filteredQuestions = questions
        .filter(q => q.question.trim() !== '') // Remove questions with only spaces or empty strings
        .map(q => {
          const trimmedOptions = q.options
            .filter(o => o.text.trim() !== '') // Remove options with only spaces or empty strings
            .map(o => ({
              ...o,
              text: o.text.trim() // Trim the option text
            }))
  
          // Ensure that the correctOption exists among the available option numbers
          const optionNumbers = trimmedOptions.map(o => o.number)
          const isValidCorrectOption = q.correctOption !== undefined && optionNumbers.includes(q.correctOption)
  
          return {
            ...q,
            question: q.question.trim(), // Trim the question text
            options: trimmedOptions,
            correctOption: isValidCorrectOption ? q.correctOption : null // Set correctOption if valid, otherwise null
          }
        })
        .filter(q => q.options.length > 0 && q.correctOption !== null) // Ensure questions have valid options and correctOption
  
      console.log('Filtered Questions:', filteredQuestions)
  
      if (filteredQuestions.length === 0) {
        console.error('No valid questions to save')
        toast({
          title: "Error",
          description: "No valid questions to save",
          variant: "destructive"
        })
        setLoading(false) // Reset loading state
        return
      }
  
      const payload = {
        address: walletAddress,
        questions: filteredQuestions,
        pricePerQuestion,
        paymentDone
      }
  
      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: paymentDone ? "Payment completed successfully!" : "Quiz saved for later",
          variant: "default"
        })

        await fetchQuiz()
        setBlinkVersion(prev => prev + 1)

      } else {
        throw new Error(result.message || 'Failed to save quiz')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false) // Reset loading state
    }
  }

  return (
    <div className="flex flex-col justify-start items-center mt-10 space-y-5 sm:space-y-6 h-full p-5">
      {orientation === 'horizontal' ? (
        <>
          <div className="w-full flex justify-center items-start max-w-7.5xl pr-12 pl-12">
            <Carousel
              opts={{
                align: "start"
              }}
              orientation={orientation}
              className="w-full max-w-7.5xl"
            >
              <CarouselContent>
                {questions.map((question, index) => (
                  <CarouselItem key={question.number} className="2xl:basis-1/4 xl:basis-1/3 md:basis-1/2">
                    <div className="relative">
                      <div className="absolute top-0 right-0 pr-2 pt-1 z-10">
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-zinc-400 hover:text-zinc-100 focus:outline-none"
                          aria-label="Remove Question"
                          style={{ background: 'none', border: 'none' }}
                        >
                          <FontAwesomeIcon icon={faClose} />
                        </button>
                      </div>
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                          <div className="space-y-2">
                            <Input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                              placeholder={`Question ${index + 1}`}
                              autoComplete="off"
                            />
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              {question.options.map((option, optIndex) => (
                                <div key={option.number} className="relative flex items-center space-x-2">
                                  <Input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                    placeholder={`Option ${optIndex + 1}`}
                                    autoComplete="off"
                                  />
                                  <button
                                    onClick={() => removeOption(index, optIndex)}
                                    className="absolute top-0 right-6 pr-2 pt-1 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                                    aria-label="Remove Option"
                                  >
                                    <FontAwesomeIcon icon={faClose} />
                                  </button>
                                  <Checkbox
                                    checked={question.correctOption === option.number}
                                    onCheckedChange={() => updateCorrectOption(index, option.number)}
                                    id={`correct-option-${index}-${optIndex}`}
                                    // className="data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                                  />
                                </div>
                              ))}
                            </div>
                            {question.options.length < 8 && (
                              <Button
                                onClick={() => addOption(index)}
                                className="mt-4"
                              >
                                + Add Option
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
                <CarouselItem className="2xl:basis-1/4 xl:basis-1/3 md:basis-1/2">
                  <div
                    onClick={addQuestion}
                    className="flex justify-center items-center w-full h-full cursor-pointer border-2 border-dashed border-zinc-600 rounded-lg p-5 transition-colors duration-300 hover:border-zinc-400 group"
                  >
                    <Label className="text-lg text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
                      + Add Question
                    </Label>
                  </div>
                </CarouselItem>
              </CarouselContent>
              {orientation === 'horizontal' && <CarouselPrevious type="button" />}
              {orientation === 'horizontal' && <CarouselNext type="button" />}
            </Carousel>
          </div>
          <div className="flex justify-end items-center w-full max-w-7xl mt-4 space-x-4 sm:pr-14 md:pr-20 2xl:pr-0">
            <Button
              onClick={() => saveQuiz(false)}  // Save for Later
              disabled={loading}
              className="w-auto px-6"
            >
              {loading ? "Loading..." : "Save for Later"}
            </Button>

            {/* Conditionally render Miniblink when action is not null */}
            {action && (
              <Miniblink
                selector={(currentAction) =>
                  currentAction.actions.find((a) => a.label === 'Pay')!
                }
                action={action}  // Ensure action is not null before passing it
                _Layout={(props) => (
                  <CustomLayout
                    {...props}
                    pricePerQuestion={pricePerQuestion}
                    setPricePerQuestion={setPricePerQuestion}
                    loading={loading}
                    setLoading={setLoading}
                    saveQuiz={saveQuiz}
                  />
                )}
              />
            )}
          </div>

          <div className="w-full flex justify-center items-start max-w-7.5xl pr-12 pl-12">
            <Carousel
              opts={{
                align: "start"
              }}
              orientation={orientation}
              className="w-full max-w-7.5xl"
            >              
              <CarouselContent>
                {questions.map((question) => {
                  return (
                    <CarouselItem key={`${question.number}-${blinkVersion}`} className="2xl:basis-1/4 xl:basis-1/3 md:basis-1/2">
                      <Blink
                        propActionApiUrl={`https://dial.to/?action=solana-action:${encodeURIComponent(`${ACTION_URL}/api/actions/quiz/question?id=${quizId}&number=${question.number}`)}`}
                        websiteText="quiz.sendarcade.fun"
                      />
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              {orientation === 'horizontal' && <CarouselPrevious type="button" />}
              {orientation === 'horizontal' && <CarouselNext type="button" />}
            </Carousel>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}
