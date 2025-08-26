'use client'

import * as React from 'react'
import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloseIcon from '@mui/icons-material/Close'
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined'
import { useTranslation } from 'next-i18next'

export type YouTubeThumbnailProps = {
    /** YouTube URL or bare video ID */
    url: string
    /** square preview size in px (defaults to 50) */
    size?: number
    /** optional dialog title */
    dialogTitle?: string
}

function extractYouTubeId(input: string): string | null {
    if (!input) return null
    const idOnly = /^[a-zA-Z0-9_-]{11}$/
    if (idOnly.test(input)) return input

    const patterns = [
        /[?&]v=([a-zA-Z0-9_-]{11})/, // watch?v=
        /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, // shorts/
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, // embed/
        /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/, // live/
    ]

    for (const rx of patterns) {
        const m = input.match(rx)
        if (m?.[1]) return m[1]
    }
    return null
}

export default function YouTubeThumbnail({ url, size = 50, dialogTitle }: YouTubeThumbnailProps) {
    const { t } = useTranslation('common')

    const [open, setOpen] = useState(false)

    const videoId = useMemo(() => extractYouTubeId(url), [url])
    const thumbUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : ''
    const embedUrl = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`
        : ''

    const handleOpen = () => videoId && setOpen(true)
    const handleClose = () => setOpen(false)

    return (
        <>
            <Tooltip title="Play on YouTube" arrow>
                <span>
                    <ButtonBase
                        onClick={handleOpen}
                        disabled={!videoId}
                        sx={{
                            width: size,
                            height: size,
                            borderRadius: 1,
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'inline-flex',
                            bgcolor: (theme) => theme.palette.action.hover,
                        }}
                        aria-label="Open YouTube video"
                    >
                        {videoId ? (
                            <Box
                                component="img"
                                src={thumbUrl}
                                alt="YouTube thumbnail"
                                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <BrokenImageOutlinedIcon fontSize="small" />
                            </Box>
                        )}

                        {/* Play overlay */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'rgba(0,0,0,0.25)',
                            }}
                        >
                            <PlayArrowIcon sx={{ fontSize: Math.max(16, size * 0.5) }} />
                        </Box>
                    </ButtonBase>
                </span>
            </Tooltip>

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                aria-labelledby="yt-dialog-title"
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <DialogTitle id="yt-dialog-title" sx={{ pr: 6 }}>
                    {dialogTitle ?? 'YouTube'}
                    <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {/* Responsive 16:9 video container */}
                    <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
                        {videoId && (
                            <Box
                                component="iframe"
                                src={embedUrl}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 0,
                                    display: 'block',
                                }}
                                title={t('youtube_url')}
                            />
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}
