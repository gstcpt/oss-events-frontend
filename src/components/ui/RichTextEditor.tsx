'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const [mode, setMode] = useState<'rich' | 'code'>('rich');
    const containerRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<any | null>(null);

    // Store the latest onChange in a ref to use inside Quill's event listener without re-binding
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let isMounted = true;
        let quill: any = null;

        const initQuill = async () => {
            if (!containerRef.current) return;

            // Clean up old instance HTML if React strict mode double-invokes
            containerRef.current.innerHTML = '<div class="min-h-[200px] max-h-70 overflow-y-auto border-b border-x border-gray-300 rounded-b-md"></div>';
            const editorNode = containerRef.current.firstElementChild as HTMLElement;

            const originalAddEventListener = document.addEventListener;
            document.addEventListener = function (type: string, listener: any, options?: any) {
                if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved') return;
                return originalAddEventListener.call(this, type, listener, options);
            };

            const QuillModule = await import('quill');
            const QuillConstructor = QuillModule.default || QuillModule;

            if (!isMounted) {
                document.addEventListener = originalAddEventListener;
                return;
            }

            quill = new QuillConstructor(editorNode, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                },
                formats: ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'image']
            });

            // Make sure toolbar has a rounded top border 
            const toolbar = containerRef.current.querySelector('.ql-toolbar');
            if (toolbar) {
                toolbar.classList.add('rounded-t-md', 'border-gray-300', 'bg-gray-50');
            }

            document.addEventListener = originalAddEventListener;
            quillInstance.current = quill;

            // Initial value mapping securely using clipboard API
            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            }

            quill.on('text-change', (delta: any, oldDelta: any, source: string) => {
                if (source === 'user') {
                    const html = quill.root.innerHTML;
                    onChangeRef.current(html === '<p><br></p>' ? '' : html);
                }
            });
        };

        initQuill();

        return () => {
            isMounted = false;
            // Unbind to prevent strict mode duplicate mutation bugs
            quillInstance.current = null;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run exactly once per actual mount lifecycle

    // React to prop value changes if they come from the 'code' editor or external resets
    useEffect(() => {
        if (quillInstance.current) {
            const currentQuillHtml = quillInstance.current.root.innerHTML;
            const normalizedValue = value || '';
            const isBr = currentQuillHtml === '<p><br></p>' || currentQuillHtml === '';

            if (currentQuillHtml !== normalizedValue && !(isBr && normalizedValue === '')) {
                const selection = quillInstance.current.getSelection();
                quillInstance.current.clipboard.dangerouslyPasteHTML(normalizedValue);
                if (selection) {
                    quillInstance.current.setSelection(selection);
                }
            }
        }
    }, [value]);

    return (
        <div className="flex flex-col gap-2 relative">
            <div className="flex justify-end pb-2">
                <button
                    type="button"
                    onClick={() => setMode('rich')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-md border ${mode === 'rich' ? 'bg-blue-50 border-blue-200 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    Text
                </button>
                <button
                    type="button"
                    onClick={() => setMode('code')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-md border-y border-r border-l-0 ${mode === 'code' ? 'bg-blue-50 border-blue-200 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    Code
                </button>
            </div>
            {/* The Quill container wrapper */}
            <div className={mode === 'rich' ? 'block' : 'hidden'} ref={containerRef} />

            {/* The Raw Code Textarea */}
            <textarea
                className={`min-h-[200px] w-full border border-gray-300 rounded-md p-3 font-mono text-sm dark:bg-gray-800 dark:text-gray-100 ${mode === 'code' ? 'block' : 'hidden'}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
