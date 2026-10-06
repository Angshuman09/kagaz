export const PdfViewer = ({ fileUrl }: { fileUrl: string }) => {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <iframe
                src={fileUrl + "#toolbar=0"}
                title="PDF viewer"
                className="h-full w-full border-0"
            />
        </div>
    );
};
