import { Editor } from '@tinymce/tinymce-react';

import { filePickerCallback } from './tiny-file-picker';

const API_KEY = 'v4fkl7lvajd9wuh5hdbzxikukislbijz1fmcj6mvt9ki6yxu'; // để trống nghĩa là dùng bản miễn phí

export default function TinyMCE({ initialValue = '', editorRef = null }) {

  console.log('RENDER: TinyMCE');
  return (
    <>
      <Editor
        apiKey={API_KEY}
        initialValue={initialValue}
        onInit={(evt, editor) => editorRef.current = editor}
        init={{
          height: '100vh',
          menubar: true,
          // toolbar_mode: 'wrap',
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
    </>
  );
}
