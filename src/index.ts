import { createFFmpeg } from "@ffmpeg/ffmpeg"
import * as Vue from "vue"
import "bootstrap"

import "./styles/index.scss"

const ffmpeg = createFFmpeg({ log: true })

Vue.createApp({
  data() {
    return {
      logtext: "",
      download: {
        url: "",
        active: false,
        name: "-",
      },
      formActive: false,
    }
  },
  async mounted() {
    await ffmpeg.load()
    this.formActive = true
  },
  methods: {
    log(text: string, breakline = true) {
      this.logtext += breakline ? `${text}\n` : text
      this.$forceUpdate()
      this.$refs.logTextarea.scrollTop = this.$refs.logTextarea.scrollHeight
    },
    async processFile(e: SubmitEvent) {
      e.preventDefault()
      this.logtext = ""
      this.formActive = false
      try {
        const startTime = performance.now()
        const filename = this.$refs.originalAudio.files[0].name
        const newFilename = filename.replace(/(\.[^.]+)$/, "_new$1")
        this.log("Started")
        this.download.active = false
        this.download.url = ""
        this.download.name = "-"

        const reader = new FileReader()
        reader.readAsArrayBuffer(this.$refs.originalAudio.files[0])
        const renderWait = new Promise((resolve, _reject) => {
          reader.onload = resolve
        })

        ffmpeg.setLogger(({ message }) => this.log(message, true))
        ffmpeg.FS(
          "writeFile",
          filename,
          // @ts-expect-error unknownなのでtargetが使えない
          new Uint8Array((await renderWait).target.result)
        )
        await ffmpeg.run(
          "-i",
          filename,
          "-af",
          "silenceremove=start_periods=1:start_duration=5:start_threshold=0.02",
          newFilename
        )
        // const newData = await newZip.generateAsync({
        //   type: "uint8array",
        // })
        // this.download.url = URL.createObjectURL(
        //   new Blob([newData], { type: "application/octet-stream" })
        // )
        this.download.name = newFilename
        this.download.active = true
        const resultUrl = URL.createObjectURL(
          new Blob([ffmpeg.FS("readFile", newFilename)], {
            type: "application/octet-binary",
          })
        )
        this.download.url = resultUrl
        this.log(`\n== Done! Took: ${performance.now() - startTime}ms`)
      } catch (e) {
        this.log("An error occurred:")
        this.log(e)
      } finally {
        this.formActive = true
      }
    },
  },
}).mount("#main")

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered: ", registration)
      })
      .catch((registrationError) => {
        console.error("Service Worker registration failed: ", registrationError)
      })
  })
}
