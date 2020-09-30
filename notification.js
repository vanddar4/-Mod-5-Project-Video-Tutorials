function notify(msg, type, context) {
    let html
    if(type === 'success') {
        html = `<div id="successBox" class="alert alert-success fade-after-5" role="alert"><%= msg %></div>`
    } else if(type === 'loading') {
        html = `<div id="loadingBox" class="alert alert-info fade-after-5" role="alert"><%= msg %></div>`
    } else if(type === 'error'){
        html = `<div id="errorBox" class="alert alert-danger fade-after-5" role="alert"><%= msg %></div>`
    }

    let template = Handlebars.compile(html)
    context.$element().prepend(template({msg}));
}

