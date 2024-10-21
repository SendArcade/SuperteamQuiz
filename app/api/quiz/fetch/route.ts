import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/utils/database'
import Quiz from '@/models/quiz'

export const GET = async (req: NextRequest) => {
  // Parse the address from the request URL query parameters
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return new Response(JSON.stringify({ message: 'Address is required' }), { status: 400 })
  }

  await connectToDB()

  try {
    // Fetch the latest quiz for the address sorted by lastSaved field
    const latestQuiz = await Quiz.findOne({ address }).sort({ lastSaved: -1 })

    if (!latestQuiz) {
      return new Response(JSON.stringify({ message: 'No quiz exists for this address' }), { status: 200 })
    }

    return new Response(JSON.stringify(latestQuiz), { status: 200 })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return new Response(JSON.stringify({ message: 'Failed to fetch quiz' }), { status: 500 })
  }
}
