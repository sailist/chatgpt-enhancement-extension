const config = {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
};

const observer = new MutationObserver(function (mutations) {
    mutations.forEach(item=>{
        if(item.type === 'characterData'){
            
        }
    })
  console.log(mutations);
});
observer.observe(document.body, config);
