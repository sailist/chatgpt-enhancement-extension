import React, { useEffect, useState } from 'react';
import App from './components/prompt';
import Prompt from './components/prompt';
import Example from './components/temp_form';
import { GPTGroup, GPTPageHandler, MarkdownButton, PDFProcess } from './trigger';

interface Styles {
    container: React.CSSProperties;
    content: React.CSSProperties;
    contentVisible: React.CSSProperties;
    contentUnVisible: React.CSSProperties;
}

const styles: Styles = {
    container: {
        position: 'fixed',
        top: '25%',
        right: -25,
        transform: 'translateY(-50%)',
        width: 50,
        height: 50,
        backgroundColor: '#F5F5F5',
        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.3)',
        borderRadius: 25,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        cursor: 'pointer',
    },
    content: {
        position: 'absolute',
        top: "-300%",
        left: "-600%",
        height: "1000%",
        width: "640%",
        overflowY: "auto",
        padding: 10,
        backgroundColor: '#ffffff',
        display: 'none',
        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.3)',
    },
    contentUnVisible: {
        display: "none",
    },
    contentVisible: {
        display: 'flex',
        flexDirection: "column"
    },
};

const Sidebar: React.FC = () => {
    const [contentVisible, setContentVisible] = useState(false);


    useEffect(() => {
        const handler = new GPTPageHandler()
        handler.addChatProcessor(new PDFProcess());
        const mdbt = new MarkdownButton()
        handler.addEventListener('response', mdbt);
        handler.addEventListener('newpage', mdbt);

        // 创建一个 MutationObserver 实例
        var observer = new MutationObserver(function (mutations) {
            // onSwitchPage
            // onResponse
            // onStopGeneration
            // onTextareaCreate
            mutations.forEach(function (mutation) {
                if (mutation.target instanceof HTMLElement) {
                    if (mutation.target.classList) {
                        var markdown_node = null;
                        if (mutation.type == 'attributes'
                            && mutation.target.classList.contains("markdown")
                            && !mutation.target.classList.contains("result-streaming")) {
                            console.log(mutation)
                            markdown_node = mutation.target;
                            console.log('End response');
                            let group_node = (
                                markdown_node!.parentElement!.parentElement!.parentElement!.parentElement!.parentElement!
                            )
                            handler.onResponse(new GPTGroup(group_node as HTMLDivElement))
                            return

                        } else if (mutation.target.firstElementChild
                            && mutation.target.firstElementChild.firstElementChild
                            && mutation.removedNodes.length == 0
                            && mutation.target.firstElementChild.firstElementChild.classList.contains('markdown')) {
                            let div_flex_node = mutation.target;
                            markdown_node = div_flex_node.querySelector('.markdown')
                            let group_node = (
                                markdown_node!.parentElement!.parentElement!.parentElement!.parentElement!.parentElement!
                            )
                            handler.onResponse(new GPTGroup(group_node as HTMLDivElement))
                        } else if (mutation.target.textContent == 'Stop generating') {
                            mutation.target.querySelector('button')?.addEventListener('click', () => {
                                handler.onStopGeneration()
                            })
                            console.log(mutation);
                            return
                        } else if (mutation.type == 'childList' && mutation.target.querySelector('textarea[tabindex="0"]')) {
                            let textarea = mutation.target.querySelector('textarea[tabindex="0"]')
                            console.log("onTextareaCreate")
                            handler.onTextareaCreate(textarea as HTMLTextAreaElement)
                        } else if (mutation.target.tagName.toLowerCase() == 'nav') {
                            console.log("onSwitchPage")
                            console.log(mutation)
                            handler.onSwitchPage()
                        } else {
                            // console.log(mutation)
                        }
                    }
                }
            });
        });

        // 配置 MutationObserver 监听选项
        var config = {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
            characterDataOldValue: true,
        };

        // 开始监听目标元素变化
        observer.observe(document.body, config);

    })


    const handleMouseEnter = () => {
        setContentVisible(true);
    };

    const handleMouseLeave = () => {
        setContentVisible(false);
    };

    return (
        <div
            style={styles.container}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={{ ...styles.content, ...(contentVisible && styles.contentVisible) }}>
                {/* <Example></Example> */}
                <App></App>
            </div>
        </div>
    );
};

export default Sidebar;
