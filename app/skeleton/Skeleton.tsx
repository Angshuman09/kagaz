interface SkeletonProps {
    className?: string
}

export const Skeleton = ({ className = "" }: SkeletonProps) => {
    return (
        <div
            className={`animate-pulse bg-slate-200 rounded ${className}`}
        />
    )
}
