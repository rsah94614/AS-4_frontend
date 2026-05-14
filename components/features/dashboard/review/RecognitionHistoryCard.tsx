"use client"

import { useState, useRef, useEffect } from "react"
import { Tag, Clock, Zap, ArrowUpRight, ArrowDownLeft, Play, Maximize2 } from "lucide-react"
import type { Review, ReviewCategory } from "@/types/review-types"
import { fmtDate } from "@/lib/review-utils"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReviewCardProps {
    review: Review
    myId: string
    categories: ReviewCategory[]
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

function Avatar({ name, isManager }: { name: string; isManager?: boolean }) {
    return (
        <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ring-2",
            isManager
                ? "bg-[#004C8F] text-white ring-[#004C8F]/20"
                : "bg-gray-100 text-gray-700 ring-gray-200"
        )}>
            {getInitials(name)}
        </div>
    )
}

function ImageAttachment({ url }: { url: string }) {
    const [lightbox, setLightbox] = useState(false)

    return (
        <>
            <button
                type="button"
                onClick={() => setLightbox(true)}
                className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-1 min-w-0"
                style={{ aspectRatio: "16/9" }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={url}
                    alt="Attachment"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
            </button>

            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setLightbox(false)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={url}
                        alt="Attachment fullscreen"
                        className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    )
}

function VideoAttachment({ url }: { url: string }) {
    const [playing, setPlaying] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handlePlay = () => {
        setPlaying(true)
        videoRef.current?.play()
    }

    return (
        <div
            className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-900 flex-1 min-w-0"
            style={{ aspectRatio: "16/9" }}
        >
            <video
                ref={videoRef}
                src={url}
                className="w-full h-full object-cover"
                controls={playing}
                playsInline
                preload="metadata"
            />
            {!playing && (
                <button
                    type="button"
                    onClick={handlePlay}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40 group-hover:bg-black/50 transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play size={16} className="text-[#004C8F] ml-0.5" fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Play Video</span>
                </button>
            )}
        </div>
    )
}

export default function ReviewCard({ review, myId, categories }: ReviewCardProps) {
    const isMine = review.reviewer_id === myId
    const [expanded, setExpanded] = useState(false)
    const [isClamped, setIsClamped] = useState(false)
    const commentRef = useRef<HTMLParagraphElement>(null)

    const catCodes: string[] =
        review.category_codes ??
        (review.category_ids ?? [])
            .map((id) => categories.find((c) => c.category_id === id)?.category_code)
            .filter(Boolean) as string[]

    const rawPts = review.raw_points != null ? review.raw_points : null

    // Show the "other" person: if I gave → show receiver; if I received → show giver
    const otherName: string | undefined = isMine
        ? (review.receiver_name ?? (review as any).receiverName)
        : (review.reviewer_name ?? (review as any).reviewerName)

    const hasAttachments = !!(review.image_url || review.video_url)

    useEffect(() => {
        const el = commentRef.current
        if (el) {
            setIsClamped(el.scrollHeight > el.clientHeight)
        }
    }, [review.comment])

    return (
        <Card className="rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200 group border-gray-200">
            <CardContent className="p-4 sm:p-5">

                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                    <Badge
                        variant="secondary"
                        className={cn(
                            "gap-1 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border-0 pointer-events-none",
                            isMine
                                ? "bg-[#004C8F]/10 text-[#004C8F] hover:bg-[#004C8F]/10"
                                : "bg-green-600/10 text-green-700 hover:bg-green-600/10"
                        )}
                    >
                        {isMine
                            ? <ArrowUpRight size={12} strokeWidth={2.5} />
                            : <ArrowDownLeft size={12} strokeWidth={2.5} />
                        }
                        {isMine ? "Given" : "Received"}
                    </Badge>

                    {rawPts !== null && (
                        <div className="flex items-center gap-1 bg-[#004C8F]/8 border border-[#004C8F]/20 rounded-md px-2.5 py-1">
                            <Zap size={11} className="text-[#004C8F]" />
                            <span className="text-[12px] font-black text-[#004C8F] tabular-nums">
                                {rawPts % 1 === 0 ? rawPts : rawPts.toFixed(2)} pts
                            </span>
                        </div>
                    )}
                </div>

                {/* Person row — who gave / who received */}
                {otherName && (
                    <div className="flex items-center gap-2.5 mb-3 px-3 py-2.5  rounded-lg ">
                        <Avatar name={otherName} />
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                                {isMine ? "Recognised" : "From"}
                            </p>
                            <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{otherName}</p>
                        </div>
                    </div>
                )}

                {/* Category tags */}
                {catCodes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {catCodes.map((code) => (
                            <Badge
                                key={code}
                                variant="secondary"
                                className="gap-1 text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md hover:bg-gray-100 border-0 pointer-events-none"
                            >
                                <Tag size={10} />
                                {code}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Comment */}
                <div>
                    <p
                        ref={commentRef}
                        className={cn(
                            "text-sm text-gray-700 leading-relaxed transition-all duration-300",
                            expanded
                                ? "max-h-[200px] overflow-y-auto pr-1"
                                : "line-clamp-3"
                        )}
                    >
                        {review.comment}
                    </p>
                    {isClamped && (
                        <button
                            onClick={() => setExpanded((prev) => !prev)}
                            className="mt-1.5 text-xs font-bold text-[#004C8F] hover:text-[#E31837] transition-colors cursor-pointer"
                        >
                            {expanded ? "See less" : "See more"}
                        </button>
                    )}
                </div>

                {/* Inline attachments */}
                {hasAttachments && (
                    <div className="flex gap-2 mt-3">
                        {review.image_url && <ImageAttachment url={review.image_url} />}
                        {review.video_url && <VideoAttachment url={review.video_url} />}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[12px] text-gray-500 flex items-center gap-1.5 font-medium">
                        <Clock size={11} />
                        {fmtDate(review.review_at)}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}