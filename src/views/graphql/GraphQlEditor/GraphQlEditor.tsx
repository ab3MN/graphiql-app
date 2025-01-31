/* eslint-disable no-console */
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css'; // Основные стили CodeMirror
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css'; // Стили подсказок
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css'; // Стили линтинга
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror/theme/monokai.css';
import { useEffect, useRef, useState } from 'react';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  IntrospectionQuery,
} from 'graphql';
import prettier from 'prettier/standalone';
import graphqlPlugin from 'prettier/plugins/graphql';
import { updateBodyInUrl } from '@utils/graphql/updateBodyInUrl';
import { Loader } from '@components/Loader/Loader';
import notification from '@/utils/notification/notification';
import { innerDivStyles, wrapperDivStyles } from './styles';

const LOCAL_KEY = 'graphQlQuery';

interface IGraphQlEditorProps {
  sdlUrl: string;
  setQuery: (query: string) => void;
  query: string;
}

export const GraphQlEditor = ({
  query,
  sdlUrl,
  setQuery,
}: IGraphQlEditorProps) => {
  const ref = useRef(null);
  const editorRef = useRef<CodeMirror.Editor | null>(null);

  const [schema, setSchema] = useState<GraphQLSchema | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const initializeSchema = async () => {
      const response = await fetch(sdlUrl, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: getIntrospectionQuery(),
        }),
      });
      const data = (await response.json()) as { data: IntrospectionQuery };

      setSchema(buildClientSchema(data.data));
    };

    initializeSchema().catch((error) => {
      if (typeof error === 'string') return;
      notification('error', 'Initialize Schema error');
    });

    return () => {
      controller.abort('useEffect cleaned');
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      const initializeEditor = () => {
        editorRef.current = CodeMirror.fromTextArea(
          ref.current as unknown as HTMLTextAreaElement,
          {
            mode: 'graphql',
            theme: 'monokai',
            value: localStorage.getItem(LOCAL_KEY) || ' ',
            lineNumbers: true,
            lint: true,
            hintOptions: {
              schema: schema || undefined,
            } as unknown as CodeMirror.ShowHintOptions,
            showHint: schema ? true : undefined,
            extraKeys: {
              'Ctrl-Space': schema ? 'autocomplete' : '',
              'Shift-Ctrl-F': () => {
                if (editorRef.current === null) return;

                const currentText = editorRef.current.getValue();

                prettier
                  .format(currentText, {
                    parser: 'graphql',
                    plugins: [graphqlPlugin],
                  })
                  .then((val) => {
                    if (editorRef.current) {
                      editorRef.current.setValue(val);
                    }
                  })
                  .catch((err: unknown) => {
                    if (err instanceof Error) {
                      notification('error', 'Error formatting code');
                    }
                  });
              },
            },
          },
        );
        editorRef.current.on('change', (editor) => {
          setQuery(editor.getValue());
          localStorage.setItem(LOCAL_KEY, editor.getValue());
        });

        editorRef.current.setValue(
          query || localStorage.getItem(LOCAL_KEY) || ' ',
        );

        editorRef.current.on('blur', (editor) => {
          updateBodyInUrl(editor.getValue());
        });
        setLoading(false);
      };

      initializeEditor();
    }

    return () => {
      if (editorRef.current) {
        (
          editorRef.current as CodeMirror.Editor & { toTextArea: () => void }
        ).toTextArea();
        editorRef.current = null;
      }
    };
  }, [sdlUrl]);

  return (
    <div style={wrapperDivStyles}>
      {loading ? (
        <div style={innerDivStyles}>
          <Loader />
        </div>
      ) : (
        ''
      )}
      <textarea ref={ref} />
    </div>
  );
};
