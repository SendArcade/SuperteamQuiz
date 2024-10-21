import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/utils/database'
import Quiz from '@/models/quiz'

export const POST = async (req: NextRequest, res: NextResponse) => {
  await connectToDB()

  const data = await req.json()
  console.log("Data: ", data)

  const { address, questions, pricePerQuestion, paymentDone } = data

  try {
    // Validation: Ensure every question has a valid `correctOption`
    questions.forEach((question: { options: { number: number }[]; correctOption: number }) => {
      const optionNumbers = question.options.map((option: { number: number }) => option.number)
      if (!optionNumbers.includes(question.correctOption)) {
        throw new Error(`Invalid correctOption for question ${question.correctOption}`)
      }
    })

    // Fix the question numbers to be sequential starting from 1
    const sequentialQuestions = questions.map((question: any, index: number) => ({
      ...question,
      number: index + 1 // Set the new number as index + 1
    }))

    // Check if a quiz already exists for the given address
    const existingQuiz = await Quiz.findOne({ address })

    if (existingQuiz) {
      if (existingQuiz.paymentDone) {
        // If payment is already done, throw an error
        console.error(`Quiz for address ${address} has already been paid for.`)
        return new Response(JSON.stringify({ message: 'Quiz already paid for.' }), { status: 400 })
      }

      // If payment is not done, update the existing quiz
      existingQuiz.questions = sequentialQuestions
      existingQuiz.pricePerQuestion = pricePerQuestion
      existingQuiz.lastSaved = new Date()
      existingQuiz.paymentDone = paymentDone

      if (paymentDone) {
        existingQuiz.paymentDoneAt = new Date()
      }

      await existingQuiz.save()
      console.log(`Quiz for address ${address} updated successfully`)

      return new Response(JSON.stringify({ message: 'Quiz updated successfully' }), { status: 200 })
    }

    // If no quiz exists, create a new one
    const newQuiz = new Quiz({
      address,
      questions: sequentialQuestions,
      pricePerQuestion,
      paymentDone,
      paymentDoneAt: paymentDone ? new Date() : null,
      lastSaved: new Date()
    })

    await newQuiz.save()
    console.log("New quiz saved successfully")

    return new Response(JSON.stringify({ message: 'Quiz saved successfully' }), { status: 201 })
  } catch (error) {
    console.error('Failed to save quiz:', error)
    return new Response(JSON.stringify({ message: 'Failed to save quiz' }), { status: 500 })
  }
}
