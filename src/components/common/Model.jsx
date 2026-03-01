import React, { useState, useEffect } from 'react';
import Input from './Input';
import Loader from './Loader';

const Model = ({ open, loading, onClose, onSubmit, fields = { name: '', meta: '' }, setFields, editData }) => {
	const [touched, setTouched] = useState({ name: false, meta: false });
	const [error, setError] = useState({ name: '', meta: '' });

	useEffect(() => {
		if (open) {
			setTouched({ name: false, meta: false });
			setError({ name: '', meta: '' });
		}
	}, [open]);

	if (!open) return null;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFields((prev) => ({ ...prev, [name]: value }));
		setTouched((prev) => ({ ...prev, [name]: true }));
		setError((prev) => ({ ...prev, [name]: value ? '' : 'Required' }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const newTouched = { name: true, meta: true };
		setTouched(newTouched);
		const newError = {
			name: fields.name ? '' : 'Required',
			meta: fields.meta ? '' : 'Required',
		};
		setError(newError);
		if (!fields.name || !fields.meta) return;
		onSubmit && onSubmit(fields);
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4 transition-opacity">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
					<h2 className="text-xl font-semibold text-gray-800">
						{editData ? 'Edit Permission' : 'Add New Permission'}
					</h2>
					<button
						className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2 focus:outline-none"
						onClick={onClose}
					>
						<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Body */}
				<div className="p-6 overflow-y-auto">
					{loading ? (
						<div className="flex justify-center items-center py-12">
							<Loader />
						</div>
					) : (
						<form id="model-form" onSubmit={handleSubmit} className="space-y-2">
							<Input
								label="Permission Name"
								name="name"
								placeholder="e.g. read_users"
								value={fields.name || ''}
								onChange={handleChange}
								onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
								error={touched.name && error.name ? error.name : ''}
								required
							/>
							<Input
								label="Meta Description"
								name="meta"
								type="textarea"
								placeholder="Describe what this permission allows..."
								value={fields.meta || ''}
								onChange={handleChange}
								onBlur={() => setTouched((prev) => ({ ...prev, meta: true }))}
								error={touched.meta && error.meta ? error.meta : ''}
								required
							/>
						</form>
					)}
				</div>

				{/* Footer Options */}
				{!loading && (
					<div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
						<button
							type="button"
							className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							type="submit"
							form="model-form"
							className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-sm"
						>
							{editData ? 'Save Changes' : 'Create Permission'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Model;
