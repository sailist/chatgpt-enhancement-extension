import { Box, Button, Card, CardActions, CardContent, Divider, InputBase, Grid, IconButton, Paper, Stack, TextField, Typography, CardHeader } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';

type RegPromptValue = { 'regex': string, 'prompt': string }[]

type RegPrompts = {
    [key: string]: RegPromptValue
}

type PromptKeys = string[]

export default function RegPromptsTab() {
    const [edit, setEdit] = useState(-1)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState<RegPromptValue>([])
    const dropzoneRef = useRef<any>();


    const addRegexItem = () => {
        const newEditContent = editContent.slice()
        newEditContent.push({ 'regex': "", "prompt": "" })
        setEditContent(newEditContent)
    }


    const removeRegexItem = (index: number) => {
        const newEditContent = editContent.slice()
        newEditContent.splice(index, 1)
        setEditContent(newEditContent)
    }

    const setEditRegexItem = (regex: string, index: number) => {
        const newEditContent = editContent.slice()
        newEditContent[index]['regex'] = regex
        setEditContent(newEditContent)
    }
    const setEditPromptItem = (prompt: string, index: number) => {
        const newEditContent = editContent.slice()
        newEditContent[index]['prompt'] = prompt
        setEditContent(newEditContent)
    }

    const [prompts, setPrompts] = useState<RegPrompts>({
        "default": [{ "regex": ".*", "prompt": "$0  Summary this text" }]
    });

    useEffect(() => {
        chrome.storage.local.get({ 'reg_prompt_keys': ["default"] } as { "reg_prompt_keys": PromptKeys }, (items) => {
            const { reg_prompt_keys } = items as { "reg_prompt_keys": PromptKeys }
            console.log('keys', reg_prompt_keys)
            chrome.storage.local.get(reg_prompt_keys, (items) => {
                console.log('initial', items)
                if (Object.keys(items).length > 0) {
                    const newPrompts = Object.assign({}, items)
                    setPrompts(newPrompts)
                }
            })
        })
    }, [])

    const removePrompt = (title: string) => {
        chrome.storage.local.get({ 'reg_prompt_keys': ["default"] } as { "reg_prompt_keys": PromptKeys }, (items) => {
            const { reg_prompt_keys } = items as { "reg_prompt_keys": PromptKeys }
            const res: { [key: string]: any } = {}
            const newPromptKeys = reg_prompt_keys.filter(item => item !== title)
            chrome.storage.local.remove(title, () => {
                chrome.storage.local.set({ 'reg_prompt_keys': newPromptKeys }, () => {
                    const newPrompts = Object.assign({}, prompts)
                    delete newPrompts[title]
                    setPrompts(newPrompts)
                })
            })
        })
    }

    const setPrompt = (title: string, content: RegPromptValue, oldTitle?: string) => {
        chrome.storage.local.get({ 'reg_prompt_keys': ["default"] } as { "reg_prompt_keys": PromptKeys }, (items) => {
            const { reg_prompt_keys } = items as { "reg_prompt_keys": PromptKeys }
            const res: { [key: string]: any } = {}
            let newPrompKeys = reg_prompt_keys.filter(item => item !== oldTitle)
            newPrompKeys.push(title)
            res['reg_prompt_keys'] = newPrompKeys
            if (oldTitle) {
                delete res[oldTitle]
            }
            res[title] = content
            console.log(res)
            chrome.storage.local.set(res, () => {
                const newPrompts = Object.assign({}, prompts)
                newPrompts[title] = content
                setPrompts(newPrompts)
                console.log('newPrompts', newPrompts)
            })
            // chrome.storage.local.set()
        })

    }


    const maxIndex = Object.keys(prompts).length + 1


    return (
        <>
            <Grid container spacing={2}>
                {/* <Stack spacing={2} direction="row"
                    useFlexGap
                    flexWrap="wrap"> */}
                {
                    Object.keys(prompts).map((item, index) => {
                        const title: string = item
                        const content = prompts[item]
                        console.log('contentis ', content)
                        return <Grid item xs={6} key={index}>
                            <Card variant="outlined">
                                <CardHeader
                                    action={
                                        <IconButton aria-label="settings">
                                            <CloseIcon></CloseIcon>
                                        </IconButton>
                                    }
                                    title={title}
                                />
                                <CardContent>
                                    {edit !== index &&
                                        content.map(({ regex, prompt }, index) => {
                                            return <Stack key={index}>
                                                <Typography variant="subtitle1">
                                                    Regex: {regex}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {prompt}
                                                </Typography>
                                                <Divider />
                                            </Stack>
                                        })
                                    }

                                    {edit === index &&
                                        <>
                                            <TextField variant="standard" placeholder="key" value={editTitle} onChange={(event) => {
                                                setEditTitle(event.target.value);
                                            }} />
                                            {
                                                editContent.map(({ regex, prompt }, index) => {
                                                    return <Stack key={index}>
                                                        {/* <TextField value={regex} variant="standard" label="regex" placeholder="正则表达式"  /> */}
                                                        <Paper
                                                            component="form"
                                                            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <InputBase
                                                                sx={{ ml: 1, flex: 1 }}
                                                                placeholder="正则表达式"
                                                                inputProps={{ 'aria-label': 'regex' }}
                                                                value={regex}
                                                                onChange={(event) => {
                                                                    setEditRegexItem(event.target.value, index);
                                                                }}
                                                            />
                                                            <IconButton type="button" sx={{ p: '10px' }} onClick={() => {
                                                                removeRegexItem(index)
                                                            }} aria-label="search">
                                                                {/* import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; */}
                                                                <CloseIcon />
                                                            </IconButton>
                                                        </Paper>
                                                        <TextField multiline value={prompt} variant="filled" label="prompt" placeholder="Prompt" onChange={(event) => {
                                                            setEditPromptItem(event.target.value, index);
                                                        }} />
                                                    </Stack>
                                                })
                                            }
                                        </>
                                    }
                                </CardContent>
                                <CardActions>
                                    {edit !== index &&
                                        <>
                                            <Button size="small" onClick={() => {
                                                setEditTitle(title)
                                                setEditContent(content)
                                                setEdit(index)
                                            }}>Edit</Button>
                                            <Button size="small" onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(content));
                                            }}>Copy</Button>
                                            <Button size="small" onClick={() => {
                                                removePrompt(title)
                                            }}>Remove</Button>
                                        </>
                                    }
                                    {edit === index &&
                                        <>
                                            <Button size="small" onClick={() => {
                                                addRegexItem()
                                            }}>Add</Button>
                                            <Button size="small" onClick={() => {
                                                setPrompt(editTitle, editContent)
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
                        setEditTitle("")
                        setEditContent([])
                        setEdit(maxIndex)
                    }}>Edit</Button>
                    {edit === maxIndex &&
                        <Card variant="outlined">
                            <CardContent>
                                <>
                                    <TextField variant="standard" label="title" placeholder="key" value={editTitle} onChange={(event) => {
                                        setEditTitle(event.target.value);
                                    }} />
                                    <Divider />
                                    {
                                        editContent.map(({ regex, prompt }, index) => {
                                            return <Stack key={index}>
                                                {/* <TextField value={regex} variant="standard" label="regex" placeholder="正则表达式"  /> */}
                                                <Paper
                                                    component="form"
                                                    sx={{ display: 'flex', alignItems: 'center' }}
                                                >
                                                    <InputBase
                                                        sx={{ flex: 1 }}
                                                        placeholder="正则表达式"
                                                        inputProps={{ 'aria-label': 'regex' }}
                                                        value={regex}
                                                        onChange={(event) => {
                                                            setEditRegexItem(event.target.value, index);
                                                        }}
                                                    />
                                                    <IconButton type="button" sx={{ p: '10px' }} onClick={() => {
                                                        removeRegexItem(index)
                                                    }} aria-label="search">
                                                        {/* import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; */}
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Paper>
                                                <TextField multiline value={prompt} variant="filled" label="prompt" placeholder="Prompt" onChange={(event) => {
                                                    setEditPromptItem(event.target.value, index);
                                                }} />
                                            </Stack>
                                        })
                                    }
                                </>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => {
                                    addRegexItem()
                                }}>Add</Button>
                                <Button size="small" onClick={() => {
                                    setPrompt(editTitle, editContent)
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
