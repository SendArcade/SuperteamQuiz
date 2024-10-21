import { Schema, model, models } from 'mongoose'

const OptionSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})

const QuestionSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  price: {
    type: Number
  },
  options: [OptionSchema],
  correctOption: {
    type: Number,
    required: true
  }
})

const QuizSchema = new Schema({
  address: {
    type: String,
    required: true,
    immmutable: true
  },
  questions: [QuestionSchema],
  paymentDone: {
    type: Boolean,
    default: false
  },
  paymentDoneAt: {
    type: Date
  },
  lastSaved: {
    type: Date,
    default: Date.now
  }
})

const Quiz =  models.Quiz || model('Quiz', QuizSchema)

export default Quiz
