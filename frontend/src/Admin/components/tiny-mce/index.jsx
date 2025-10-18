import { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useState } from 'react';

import { filePickerCallback } from './tiny-file-picker';
import Loading from '../loading';

const API_KEY = 'v4fkl7lvajd9wuh5hdbzxikukislbijz1fmcj6mvt9ki6yxu'; // để trống nghĩa là dùng bản miễn phí

export default function TinyMCE(props) {
  const editorRef = useRef(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLog = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  console.log('RENDER: TinyMCE');
  
  if (loading) return (
    <Loading />
  )

  return (
    <div>
      <Editor
        apiKey={API_KEY}
        onInit={(evt, editor) => editorRef.current = editor}
        init={{
          height: 500,
          menubar: true,
          toolbar_mode: 'wrap',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: "undo redo | accordion accordionremove |" +
            " blocks fontfamily fontsize | bold italic underline strikethrough |" +
            " align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | code fullscreen preview | print ",
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          file_picker_callback: (callback, value, meta) => filePickerCallback(callback, value, meta,
            { compress: true, quality: 0.5 }
          ),
          // appendTo: document.body,
        }}
      />
      <button onClick={handleLog}>Log content</button>
    </div>
  );
}
