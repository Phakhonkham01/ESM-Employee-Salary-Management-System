type Props = {
    open: boolean
    onClose: () => void
}

const OtModule = ({ open, onClose }: Props) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    ສົ່ງຄຳຂໍ OT
                </h2>

                {/* Content */}
                <div className="space-y-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            OT Date
                        </label>
                        <input
                            type="date"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Start Time
                        </label>
                        <div className="flex gap-2">
                            {/* Hour */}
                            <select className="border rounded-lg px-3 py-2 text-sm">
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option
                                        key={i}
                                        value={i.toString().padStart(2, '0')}
                                    >
                                        {i.toString().padStart(2, '0')}
                                    </option>
                                ))}
                            </select>

                            {/* Minute */}
                            <select className="border rounded-lg px-3 py-2 text-sm">
                                <option value="00">00</option>
                                <option value="30">30</option>
                            </select>
                        </div>
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            End Time
                        </label>
                        <input
                            type="time"
                            step={1800}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reason (optional)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Reason"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
                    >
                        Cancel
                    </button>
                    <button className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OtModule
