import { NextRequest } from 'next/server'
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from "@solana/actions"
import { Transaction, TransactionInstruction, PublicKey, ComputeBudgetProgram, Connection, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { connectToDB } from '@/utils/database'
import Quiz from '@/models/quiz'
import mongoose from 'mongoose'

interface Option {
  number: number
  text: string
}

interface Question {
  number: number
  question: string
  options: Option[]
}

const ACTION_URL = "https://2d77-49-237-46-148.ngrok-free.app"

const FASTAPI_URL = process.env.FASTAPI_URL

export const GET = async (req: NextRequest) => {
  try {

    // Fetch the quiz _id and question number from query params
    const quizId = req.nextUrl.searchParams.get('id')
    const questionNumber = parseInt(req.nextUrl.searchParams.get('number') || '1')

    // Ensure the id is valid
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return new Response(JSON.stringify({ message: "Invalid quiz id" }), { status: 400 })
    }

    // Connect to DB and fetch the quiz
    await connectToDB()
    const quiz = await Quiz.findById(quizId)

    if (!quiz) {
      return new Response(JSON.stringify({ message: "Quiz not found" }), { status: 404 })
    }

    // Find the question by number
    const question = quiz.questions.find((q: Question) => q.number === questionNumber)

    if (!question) {
      return new Response(JSON.stringify({ message: "Question not found" }), { status: 404 })
    }

    const imageResponse = await fetch(`${FASTAPI_URL}/image?question=${encodeURIComponent(question.question)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${FastApiIdentityToken}`
      }
    })
    const imageResponseData = await imageResponse.json()
    const icon = imageResponseData.url
    console.log("Image: ", icon)

    // Construct the action payload with question and options
    const payload: ActionGetResponse = {
      type: "action",
      icon,
      title: `Question ${question.number}`, // Set the question title
      label: '',
      description: '',
      links: {
        actions: question.options.map((option: Option) => ({
          type: "post",
          href: `${ACTION_URL}/api/actions/quiz/question?amount=0.001&address=4WEkZJprSsHxadCitfqNdVS3i44sgTP41iETZe4AzS92`,
          label: option.text, // Use option text as label
          parameters: [] // No additional parameters
        }))
      }
    }

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS
    })

  } catch (error) {
    console.error('Failed to fetch quiz or question:', error)
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 })
  }
}

export const OPTIONS = GET

export const POST = async (req: NextRequest) => {
  try {
    const body: ActionPostRequest = await req.json()

    let account: PublicKey
    try { 
      account = new PublicKey(body.account)
    } catch (err) {
      return new Response('Invalid account provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS
      })
    }

    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, 'confirmed')

    const transaction = new Transaction()

    const amount = req.nextUrl.searchParams.get('amount')
    const admin_address = req.nextUrl.searchParams.get('address')

    if (!amount || !admin_address) {
      return new Response('Missing required parameters', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS
      })
    }

    const transferTx = SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey(admin_address),
      lamports: Math.round(parseFloat(amount) * LAMPORTS_PER_SOL)
    })

    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from(`sol_transfer}`, "utf-8"),
        keys: []
      }),
      transferTx
    )

    transaction.feePayer = account
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `Transfer ${amount} SOL to ${admin_address}`
      }
    })

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS })

  } catch (error) {
    console.error("Error: ", error)
    return Response.json("An unknown error occured", { status: 500 })
  }
}
