import { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Sparkle,
} from "lucide-react";

import "@tiptap/extension-highlight";
import "@tiptap/extension-underline";
import "@tiptap/extension-text-align";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface EditorExtensionProps {
  editor: Editor | null;
}

/**
 * Convert markdown (what the AI model actually returns) into HTML
 * that Tiptap can parse. Handles: **bold**, *italic*, _italic_,
 * `code`, # headings, -/* bullet lists, 1. ordered lists, > blockquotes.
 * Lines that already contain HTML tags are passed through (with inline
 * markdown still converted), so pure-HTML responses work too.
 */
function markdownToHtml(markdown: string): string {
  const lines = markdown
    .replace(/```(?:html|markdown|md)?/g, "")
    .split("\n");

  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const applyInline = (text: string): string =>
    text
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/_([^_]+)_/g, "<em>$1</em>");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    // Already HTML — pass through, but still convert leftover markdown inline
    if (line.startsWith("<")) {
      closeList();
      html.push(applyInline(line));
      continue;
    }

    // Headings: # through ######
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${applyInline(heading[2])}</h${level}>`);
      continue;
    }

    // Bullet list: - item, * item, + item
    if (/^[-*+]\s+/.test(line)) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${applyInline(line.replace(/^[-*+]\s+/, ""))}</li>`);
      continue;
    }

    // Ordered list: 1. item, 1) item
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${applyInline(ordered[1])}</li>`);
      continue;
    }

    // Blockquote: > text
    if (line.startsWith(">")) {
      closeList();
      html.push(
        `<blockquote><p>${applyInline(line.replace(/^>\s?/, ""))}</p></blockquote>`,
      );
      continue;
    }

    // Plain paragraph
    closeList();
    html.push(`<p>${applyInline(line)}</p>`);
  }

  closeList();
  return html.join("");
}

export const EditorExtension = ({ editor }: EditorExtensionProps) => {
  const [isActive, setIsActive] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  // Ref guard so a double-click / re-render can't start two concurrent streams
  const streamingRef = useRef(false);

  const SearchAI = useAction(api.myAction.search);
  const addNotes = useMutation(api.notes.saveNote);
  const { fileId } = useParams();

  useEffect(() => {
    if (!editor) return;

    const updateActiveState = () => {
      setIsActive((prev) => !prev);
    };

    editor.on("update", updateActiveState);
    editor.on("selectionUpdate", updateActiveState);

    return () => {
      editor.off("update", updateActiveState);
      editor.off("selectionUpdate", updateActiveState);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const onAiClick = async () => {
    // Prevent double-invocation (React state updates are async, so also use a ref)
    if (streamingRef.current || loading) return;
    streamingRef.current = true;
    setLoading(true);
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " ",
    );

    if (!selectedText) {
      streamingRef.current = false;
      setLoading(false);
      return;
    }

    console.log("Selected text:", selectedText);
    console.log("File ID:", fileId);

    try {
      // Get context from your vector search
      const result = await SearchAI({
        query: selectedText,
        fileId: fileId as string,
      });

      console.log("Search result:", result);

      if (!result || result.trim().length === 0) {
        toast.warning(
          "No indexed content found for this PDF — the AI will answer from general knowledge."
        );
      }

      const PROMPT = `
You are a helpful AI assistant.

USER QUESTION:
${selectedText}

RETRIEVED CONTEXT (may be incomplete):
${result}

TASK:
Use the retrieved context as the primary source to answer the question.  
If the context is unclear, incomplete, or empty, use your general knowledge to provide a helpful and reasonable explanation.

STYLE GUIDELINES:
- Explain in simple, short and easy-to-understand language.
- Be clear, structured, and beginner-friendly.
- Do not mention "context" or "retrieved data" in the answer.
- Do not leave large space between the answer and key points.
- Focus on giving value, not disclaimers.

OUTPUT FORMAT:
Start your response with exactly one <h2>Answer</h2> heading, followed by your explanation.
Use markdown for formatting: **bold** for emphasis, *italic* for italic, - for bullet points, and # for subheadings.
`;

      // NOTE: we deliberately do NOT insert a separate "Answer:" placeholder here —
      // the model already outputs a single <h2>Answer</h2> heading. Inserting both
      // was the cause of the duplicate answers.

      // Store the position where we'll insert streaming content
      const answerStartPos = editor.state.doc.content.size;

      let streamedAnswer = "";

      console.log("Calling streaming API...");

      // Call the streaming API
      const response = await fetch("/api/ai-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: PROMPT }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      console.log("Starting to read stream...");

      // Buffer for SSE lines that may be split across network chunks
      let lineBuffer = "";

      // Replace the streamed region with the current full answer.
      // Guarded so a shrinking doc can't throw and desync the insert.
      const renderAnswer = (content: string) => {
        const docSize = editor.state.doc.content.size;
        const from = Math.min(answerStartPos, docSize);
        editor.commands.deleteRange({ from, to: docSize });
        editor.commands.insertContentAt(from, markdownToHtml(content));
      };

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("Stream reading done");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log("Received chunk:", chunk);

        lineBuffer += chunk;
        const lines = lineBuffer.split("\n");
        // Keep the last element — it may be an incomplete line
        lineBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              console.log("Received DONE signal");
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              console.log("Parsed data:", parsed);

              if (typeof parsed.text === "string" && parsed.text.length > 0) {
                streamedAnswer += parsed.text;
              }

              renderAnswer(streamedAnswer);
            } catch (e) {
              console.error("Error parsing chunk:", e, "Data:", data);
            }
          }
        }
      }

      // Final reconciliation — in case the last chunks were lost or the
      // region was edited mid-stream, ensure the full answer is present exactly once.
      if (streamedAnswer.trim().length > 0) {
        renderAnswer(streamedAnswer);
      }

      console.log("Final streamed answer:", streamedAnswer);

      // Save to database
      const Allnote = editor.getHTML();
      await addNotes({
        fileId: fileId as string,
        note: Allnote,
        createBy: user?.primaryEmailAddress?.emailAddress as string,
      });

      console.log("Streaming completed successfully");
    } catch (error) {
      console.error("Error during AI streaming:", error);
      toast.error("Something went wrong while generating the answer.");
    } finally {
      streamingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="bg-linear-to-b from-white to-gray-50/50 border-b border-gray-200/80 px-6 py-3 rounded-t-xl shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Unified Toolbar Group */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white rounded-lg border border-gray-200/60 shadow-sm">
          {/* Headings */}
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("heading", { level: 1 })
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("heading", { level: 2 })
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("heading", { level: 3 })
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("bold")
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("italic")
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("underline")
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("highlight")
                ? "bg-amber-50 text-amber-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive({ textAlign: "left" })
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive({ textAlign: "center" })
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive({ textAlign: "right" })
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("bulletList")
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md transition-all duration-150 ${
              editor.isActive("orderedList")
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* AI Button - Separate but cohesive */}
        <button
          onClick={() => onAiClick()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#d8b131] hover:bg-[#D4AF37] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="AI Assistant"
        >
          <Sparkle className="w-4 h-4" />
          <span>{loading ? "Thinking..." : "Ask"}</span>
        </button>
      </div>
    </div>
  );
};
