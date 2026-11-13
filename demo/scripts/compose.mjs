// Stitches the per-scenario recordings into side-by-side MP4s (one per issue) under evidence/videos/.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import ffmpeg from '@ffmpeg-installer/ffmpeg'

const groups = {
  'dayjs-1271': [['1271', ['before', 'after']]],
  'dayjs-2609': [['2609', ['before', 'after']], ['2609-comment', ['before', 'after']]],
  'mui-x-10584': [['mui', ['reported', 'before', 'after']]],
  'tz-fallback-overlap': [['overlap-summer', ['before', 'after']], ['overlap-winter', ['before', 'after']]]
}

mkdirSync('evidence/videos', { recursive: true })
for (const [name, parts] of Object.entries(groups)) {
  const inputs = []
  const filters = []
  const stacked = []
  parts.forEach(([scenario, variants], p) => {
    const height = variants.length === 3 ? 540 : 480
    const labels = variants.map((v) => {
      const i = inputs.length / 2
      inputs.push('-i', `evidence/${v}/${scenario}.webm`)
      filters.push(`[${i}:v]tpad=stop_mode=clone:stop_duration=2.5,scale=-2:${height},setsar=1[v${i}]`)
      return `[v${i}]`
    })
    filters.push(`${labels.join('')}hstack=inputs=${labels.length}:shortest=1,scale=1920:-2,pad=1920:ceil(ih/2)*2[s${p}]`)
    stacked.push(`[s${p}]`)
  })
  filters.push(stacked.length > 1 ? `${stacked.join('')}concat=n=${stacked.length}:v=1:a=0[out]` : `${stacked[0]}null[out]`)
  execFileSync(ffmpeg.path, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filters.join(';'),
    '-map', '[out]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', `evidence/videos/${name}.mp4`])
  console.log(`evidence/videos/${name}.mp4`)
}
