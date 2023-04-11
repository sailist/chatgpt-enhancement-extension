import { Box, Button, Card, CardActions, CardContent, CardHeader, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type PromptValue = { 'title': string, 'content': string }
type Prompts = {
    [key: string]: PromptValue
}

type PromptKeys = string[]

function _(k: string) {
    return "p+" + k
}
function __(k: string[]) {
    return k.map(item => _(item))
}

export default function Prompts() {
    const [edit, setEdit] = useState(-1)
    // const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState<PromptValue>({ 'title': "", "content": "" })
    // const classes = useStyles();
    const dropzoneRef = useRef<any>();

    const [prompts, setPrompts] = useState<Prompts>({
        "default": { "title": "default", "content": "I'm chatgpt-enhancement-extension" },
    });

    useEffect(() => {
        console.log('keys')
        chrome.storage.local.get({ 'prompt_keys': ["default"] } as { "prompt_keys": PromptKeys }, (items) => {
            const { prompt_keys } = items as { "prompt_keys": PromptKeys }
            console.log('keys', prompt_keys)
            chrome.storage.local.get(__(prompt_keys), (items) => {
                console.log('initial', items)
                if (Object.keys(items).length > 0) {
                    const newPrompts = Object.assign({}, items)
                    setPrompts(newPrompts)
                }
            })
        })
    }, [])

    const removePrompt = (title: string) => {
        chrome.storage.local.get({ 'prompt_keys': ["default"] } as { "prompt_keys": PromptKeys }, (items) => {
            const { prompt_keys } = items as { "prompt_keys": PromptKeys }
            const res: { [key: string]: any } = {}
            const newPromptKeys = prompt_keys.filter(item => item !== title)
            chrome.storage.local.remove(_(title), () => {
                chrome.storage.local.set({ 'prompt_keys': newPromptKeys }, () => {
                    const newPrompts = Object.assign({}, prompts)
                    delete newPrompts[_(title)]
                    setPrompts(newPrompts)
                })
            })
        })
    }

    const setPrompt = (title: string, content: PromptValue, oldTitle?: string) => {
        chrome.storage.local.get({ 'prompt_keys': ["default"] } as { "prompt_keys": PromptKeys }, (items) => {
            const title = content.title
            const { prompt_keys } = items as { "prompt_keys": PromptKeys }
            const res: { [key: string]: any } = {}
            let newPrompKeys = prompt_keys.filter(item => item !== oldTitle)
            newPrompKeys.push(title)
            res['prompt_keys'] = newPrompKeys
            if (oldTitle) {
                delete res[_(oldTitle)]
            }
            res[_(title)] = content
            console.log(res)
            chrome.storage.local.set(res, () => {
                const newPrompts = Object.assign({}, prompts)
                newPrompts[_(title)] = content
                setPrompts(newPrompts)
                console.log('newPrompts', newPrompts)
            })
        })

    }

    const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        // dropzoneRef.current.classList.add(classes.dropzoneActive);
    };

    const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        // dropzoneRef.current.classList.remove(classes.dropzoneActive);
    };

    const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        // dropzoneRef.current.classList.remove(classes.dropzoneActive);
        console.log(event.dataTransfer.files);
    };

    const maxIndex = Object.keys(prompts).length + 1

    console.log(maxIndex)
    return (
        <>
            <Grid container spacing={2}>
                {
                    Object.keys(prompts).map((item, index) => {
                        const { title, content } = prompts[item]
                        console.log('map', title)
                        return <Grid item xs={4} key={index}>
                            <Card variant="outlined">
                                <CardHeader
                                    action={
                                        <>
                                            <IconButton aria-label="settings" onClick={() => {
                                                navigator.clipboard.writeText(content);
                                            }}>
                                                <ContentCopyIcon></ContentCopyIcon>
                                            </IconButton>
                                            <IconButton aria-label="settings" onClick={() => {
                                                removePrompt(title)
                                            }}>
                                                <CloseIcon></CloseIcon>
                                            </IconButton>
                                        </>
                                    }
                                    title={title}
                                />
                                <CardContent>
                                    {edit !== index &&
                                        <>
                                            <Typography variant="h6">
                                                {title}
                                            </Typography>
                                            <Typography variant="body2">
                                                {content}
                                            </Typography>
                                        </>
                                    }
                                    {edit === index &&
                                        <>
                                            <TextField variant="standard" placeholder="key" value={editContent.title} onChange={(event) => {
                                                // setEditTitle(event.target.value);
                                                setEditContent({ title: event.target.value, content: editContent.content })
                                            }} />
                                            <TextField
                                                placeholder="Prompt"
                                                multiline
                                                value={editContent.content}
                                                onChange={(event) => {
                                                    setEditContent({ title: editContent.title, content: event.target.value });
                                                }}
                                            />
                                        </>
                                    }
                                </CardContent>
                                <CardActions>
                                    {edit !== index &&
                                        <>
                                            <Button size="small" onClick={() => {
                                                setEditContent(prompts[item])
                                                setEdit(index)
                                            }}>Edit</Button>
                                            <Button size="small" onClick={() => {
                                                navigator.clipboard.writeText(content);
                                            }}>Copy</Button>
                                        </>
                                    }
                                    {edit === index &&
                                        <>
                                            <Button size="small" onClick={() => {
                                                setPrompt("unused", editContent, title)
                                                setEdit(-1)
                                            }}>Submit</Button>
                                            <Button size="small" onClick={() => {
                                                setEdit(-1)
                                            }}>Cancel</Button>
                                        </>
                                    }
                                </CardActions>
                            </Card>
                        </Grid>
                    })
                }
                <Grid item xs={12}>
                    <Button size="small" onClick={() => {
                        setEditContent({ 'title': "", "content": "" })
                        setEdit(maxIndex)
                    }}>Edit</Button>
                    <Box component="span"
                        ref={dropzoneRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{ p: 2, border: '1px dashed grey' }}>
                        <span>Drag and drop files here</span>
                    </Box>
                    {edit === maxIndex &&
                        <Card variant="outlined">
                            <CardContent>
                                <TextField variant="standard" placeholder="key" value={editContent.title} onChange={(event) => {
                                    setEditContent({ title: event.target.value, content: editContent.content })
                                }} />
                                <TextField
                                    placeholder="Prompt"
                                    multiline
                                    value={editContent.content}
                                    onChange={(event) => {
                                        setEditContent({ title: editContent.title, content: event.target.value });
                                    }}
                                />
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => {
                                    setPrompt("", editContent)
                                    setEdit(-1)
                                }}>Submit</Button>
                                <Button size="small" onClick={() => {
                                    setEdit(-1)
                                }}>Cancel</Button>
                            </CardActions>
                        </Card>
                    }
                </Grid>
            </Grid>
        </>
    )
}
