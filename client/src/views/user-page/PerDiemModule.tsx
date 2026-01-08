type Props = {
    open: boolean
    onClose: () => void
}

const PerDiemModule = ({ open, onClose }: Props) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    ສົ່ງຄຳຂໍ ວຽກນອກ
                </h2>

                <div className="space-y-4">
                    <input
                        type="number"
                        placeholder="Number of days"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />

                    <textarea
                        placeholder="Work details"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PerDiemModule
