'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Link,
  Unlink,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter description...',
  className,
  disabled = false
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Ensure component only renders on client side
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update editor content when value prop changes OR when component mounts
  React.useEffect(() => {
    if (isMounted && editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const newValue = value || '';
      
      // Only update if content is different to avoid cursor jumping
      if (currentContent !== newValue) {
        editorRef.current.innerHTML = newValue;
      }
    }
  }, [value, isMounted]);

  // Don't render on server side
  if (!isMounted) {
    return (
      <div className={cn('border rounded-lg min-h-[120px] p-3 bg-gray-50', className)}>
        <div className="text-gray-400 text-sm">{placeholder}</div>
      </div>
    );
  }

  const execCommand = (command: string, value?: string) => {
    if (typeof document === 'undefined' || !editorRef.current) return;
    
    editorRef.current.focus();
    
    // Use modern Selection API instead of deprecated execCommand
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    try {
      switch (command) {
        case 'bold':
          document.execCommand('bold', false);
          break;
        case 'italic':
          document.execCommand('italic', false);
          break;
        case 'underline':
          document.execCommand('underline', false);
          break;
        case 'insertUnorderedList':
          document.execCommand('insertUnorderedList', false);
          break;
        case 'insertOrderedList':
          document.execCommand('insertOrderedList', false);
          break;
        case 'formatBlock':
          if (value === 'blockquote') {
            document.execCommand('formatBlock', false, 'blockquote');
          }
          break;
        case 'createLink':
          if (value) {
            document.execCommand('createLink', false, value);
          }
          break;
        case 'unlink':
          document.execCommand('unlink', false);
          break;
        case 'undo':
          document.execCommand('undo', false);
          break;
        case 'redo':
          document.execCommand('redo', false);
          break;
        default:
          document.execCommand(command, false, value);
      }
    } catch (error) {
      console.warn('Command failed:', command, error);
    }
    
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Ctrl+B, Ctrl+I, Ctrl+U shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      try {
        execCommand('createLink', url);
      } catch (error) {
        console.warn('Link command failed:', error);
        // Fallback: manually create link
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const link = document.createElement('a');
          link.href = url;
          link.textContent = selection.toString() || 'Link';
          
          if (range.collapsed) {
            range.insertNode(link);
          } else {
            range.deleteContents();
            range.insertNode(link);
          }
          
          handleInput();
        }
      }
    }
  };

  const removeLink = () => {
    try {
      execCommand('unlink');
    } catch (error) {
      console.warn('Unlink command failed:', error);
      // Fallback: manually remove link
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const link = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
          ? range.commonAncestorContainer.parentElement?.closest('a')
          : (range.commonAncestorContainer as Element)?.closest('a');
        
        if (link) {
          const parent = link.parentNode;
          if (parent) {
            while (link.firstChild) {
              parent.insertBefore(link.firstChild, link);
            }
            parent.removeChild(link);
            handleInput();
          }
        }
      }
    }
  };

  const insertList = (ordered: boolean = false) => {
    if (typeof document === 'undefined' || !editorRef.current) return;
    
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const listElement = document.createElement(ordered ? 'ol' : 'ul');
    const listItem = document.createElement('li');
    
    // Check if we're already in a list
    const currentList = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
      ? range.commonAncestorContainer.parentElement?.closest('ol, ul')
      : (range.commonAncestorContainer as Element)?.closest('ol, ul');
    
    if (currentList) {
      // If we're in a list, just create a new list item
      const newListItem = document.createElement('li');
      newListItem.textContent = 'List item';
      newListItem.style.margin = '0.25rem 0';
      currentList.appendChild(newListItem);
      
      // Move cursor to new list item and select placeholder text
      const newRange = document.createRange();
      newRange.selectNodeContents(newListItem);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Create new list
      if (range.collapsed) {
        // If no text is selected, create a list item with placeholder text
        listItem.textContent = 'List item';
        listItem.style.margin = '0.25rem 0';
        listElement.style.margin = '0.5rem 0';
        listElement.style.paddingLeft = '1.5rem';
        listElement.appendChild(listItem);
        
        // Insert the list
        range.insertNode(listElement);
        
        // Move cursor to list item and select the placeholder text
        const newRange = document.createRange();
        newRange.selectNodeContents(listItem);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // If text is selected, convert it to list items
        const selectedText = range.extractContents();
        const textContent = selectedText.textContent || '';
        
        // Split by line breaks or create single item
        const lines = textContent.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          lines.push('List item');
        }
        
        lines.forEach(line => {
          const li = document.createElement('li');
          li.textContent = line.trim();
          li.style.margin = '0.25rem 0';
          listElement.appendChild(li);
        });
        
        // Apply styling to the list element
        listElement.style.margin = '0.5rem 0';
        listElement.style.paddingLeft = '1.5rem';
        
        range.insertNode(listElement);
        
        // Move cursor to the end of the list
        const newRange = document.createRange();
        newRange.setStartAfter(listElement);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    handleInput();
  };

  const insertBlockquote = () => {
    if (typeof document === 'undefined' || !editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      document.execCommand('formatBlock', false, 'blockquote');
    } catch (error) {
      console.warn('Blockquote command failed:', error);
      // Fallback: manually create blockquote
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const blockquote = document.createElement('blockquote');
        
        if (range.collapsed) {
          blockquote.textContent = 'Quote text';
          range.insertNode(blockquote);
        } else {
          const contents = range.extractContents();
          blockquote.appendChild(contents);
          range.insertNode(blockquote);
        }
        
        // Move cursor to blockquote
        const newRange = document.createRange();
        newRange.selectNodeContents(blockquote);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    handleInput();
  };

  const isCommandActive = (command: string) => {
    if (typeof document === 'undefined' || !editorRef.current) return false;
    
    try {
      // Check if the editor has focus and selection
      if (document.activeElement !== editorRef.current) return false;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      
      // Special handling for list commands
      if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        const range = selection.getRangeAt(0);
        const listElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
          ? range.commonAncestorContainer.parentElement?.closest('ol, ul')
          : (range.commonAncestorContainer as Element)?.closest('ol, ul');
        
        if (listElement) {
          if (command === 'insertUnorderedList' && listElement.tagName === 'UL') return true;
          if (command === 'insertOrderedList' && listElement.tagName === 'OL') return true;
        }
        return false;
      }
      
      // Use queryCommandState for basic commands
      return document.queryCommandState(command);
    } catch (error) {
      console.warn('Command state check failed:', command, error);
      return false;
    }
  };

  const toolbarButtons = [
    {
      command: 'bold',
      icon: Bold,
      label: 'Bold',
      shortcut: 'Ctrl+B'
    },
    {
      command: 'italic',
      icon: Italic,
      label: 'Italic',
      shortcut: 'Ctrl+I'
    },
    {
      command: 'underline',
      icon: Underline,
      label: 'Underline',
      shortcut: 'Ctrl+U'
    },
    {
      command: 'insertUnorderedList',
      icon: List,
      label: 'Bullet List',
      onClick: () => insertList(false)
    },
    {
      command: 'insertOrderedList',
      icon: ListOrdered,
      label: 'Numbered List',
      onClick: () => insertList(true)
    },
    {
      command: 'formatBlock',
      icon: Quote,
      label: 'Quote',
      onClick: insertBlockquote
    },
    {
      command: 'createLink',
      icon: Link,
      label: 'Insert Link',
      onClick: insertLink
    },
    {
      command: 'unlink',
      icon: Unlink,
      label: 'Remove Link',
      onClick: removeLink
    },
    {
      command: 'undo',
      icon: Undo,
      label: 'Undo',
      shortcut: 'Ctrl+Z'
    },
    {
      command: 'redo',
      icon: Redo,
      label: 'Redo',
      shortcut: 'Ctrl+Shift+Z'
    }
  ];

  return (
    <div className={cn('border rounded-lg', className)}>
      {/* Toolbar */}
      <div className='flex items-center gap-1 p-2 border-b bg-gray-50 rounded-t-lg'>
        {toolbarButtons.map((button) => {
          const Icon = button.icon;
          const isActive = button.command && isCommandActive(button.command);
          
          return (
            <Button
              key={button.command}
              type='button'
              variant={isActive ? 'default' : 'ghost'}
              size='sm'
              className={cn(
                'h-8 w-8 p-0',
                isActive && 'bg-primary text-primary-foreground'
              )}
              onClick={button.onClick || (() => execCommand(button.command!))}
              disabled={disabled}
              title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
            >
              <Icon className='h-4 w-4' />
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'min-h-[120px] p-3 outline-none text-sm',
          'focus:ring-2 focus:ring-primary/20 focus:border-primary',
          isFocused && 'ring-2 ring-primary/20 border-primary',
          disabled && 'bg-gray-50 cursor-not-allowed opacity-50'
        )}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />


      {/* Styles for the editor content */}
      <style jsx>{`
        [contenteditable] {
          position: relative;
        }
        
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
          top: 12px;
          left: 12px;
        }
        
        [contenteditable] h1,
        [contenteditable] h2,
        [contenteditable] h3,
        [contenteditable] h4,
        [contenteditable] h5,
        [contenteditable] h6 {
          font-weight: 600;
          margin: 0.5rem 0;
        }
        
        [contenteditable] h1 { font-size: 1.5rem; }
        [contenteditable] h2 { font-size: 1.25rem; }
        [contenteditable] h3 { font-size: 1.125rem; }
        
        [contenteditable] p {
          margin: 0.25rem 0;
        }
        
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        [contenteditable] ul {
          list-style-type: disc;
        }
        
        [contenteditable] ol {
          list-style-type: decimal;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
          display: list-item;
        }
        
        [contenteditable] ul li {
          list-style-type: disc;
          list-style-position: outside;
        }
        
        [contenteditable] ol li {
          list-style-type: decimal;
          list-style-position: outside;
        }
        
        /* Nested lists */
        [contenteditable] ul ul {
          list-style-type: circle;
        }
        
        [contenteditable] ul ul ul {
          list-style-type: square;
        }
        
        [contenteditable] ol ol {
          list-style-type: lower-alpha;
        }
        
        [contenteditable] ol ol ol {
          list-style-type: lower-roman;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 0.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] strong,
        [contenteditable] b {
          font-weight: 600;
        }
        
        [contenteditable] em,
        [contenteditable] i {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
