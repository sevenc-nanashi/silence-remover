import express from "express"
const app = express()

app.use((_, res, next) => {
  res.header("Cross-Origin-Opener-Policy", "same-origin")
  res.header("Cross-Origin-Embedder-Policy", "require-corp")
  next()
})

app.use(express.static("dist"))

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
})

export default app
