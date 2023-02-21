
//parametro sessao get
const urlParams = new URLSearchParams(window.location.search);
const channelName = urlParams?.get('session')?.split(' ')?.join('-')?.toLowerCase()?.trim()?.toLowerCase();
const contact = urlParams?.get('contact')?.split(' ')?.join('-')?.toLowerCase()?.trim()?.toLowerCase();

// Connect to the server
const bearer = localStorage.getItem('token')
const socket = io('http://localhost:9090', {
    query: {
        bearer: bearer,
        channelName: channelName
    }
});

// Get references to DOM elements
const messages = document.getElementById('messages');
const chatlist = document.getElementsByClassName('chat-list')[0];
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

console.log(`channelName: ${channelName}`);

//window loadd request get async fetch
window.addEventListener('load', async (event) => {

    //featch /api/profile/number
    const response_profile = await fetch(`http://localhost:9090/api/profile/${channelName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data_profile = await response_profile.json();

    console.log('data_profile:', data_profile);

    // parameter welcome == true 
    //chat-header display none
    if(urlParams?.get('welcome') === 'true') {
        
        $('.chat-header-1').css('display', 'none');
        $('.chat-message').css('display', 'none');

        //chat-history height 600px
        $('.chat-history').css('height', '550px');
        //chat-history background image https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg
        $('.chat-history').css('background-image', 'url(https://conteudo.imguol.com.br/c/noticias/2015/01/23/logo-whatsapp-whatsapp-na-web-1422023070243_300x300.jpg)');
        //baackground color #000
        $('.chat-history').css('background-color', 'rgb(252 252 253)');
        //background-size cover opacity 0.5
        $('.chat-history').css('background-size', 'auto');
        $('.chat-history').css('background-repeat', 'no-repeat');
        $('.chat-history').css('background-position', 'center');
        $('.chat-history').css('opacity', '0.5');

    }

    const response = await fetch(`http://localhost:9090/api/chats/${channelName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    console.log('data:', data);

    if (data?.response?.contacts?.length > 0) {
        chatlist.innerHTML = '';
        data?.response?.contacts?.forEach((item) => {

            console.log('item:', item);
            
            //id author user
            if(item?.isUser === true) {

                let content_html = `<div class="chat-item d-flex pl-3 pr-0 pt-3 pb-3 getChatByNumber _${item?.contact?.id?.user}" id="${item?.contact?.id?.user}" title="${item?.contact?.formattedName}" onclick="window.history.pushState({}, '', '?contact=${item?.contact?.id?.user}&session=${channelName}');">
                    <div class="w-100">
                    <div class="d-flex pl-0">
                        <img class="rounded-circle shadow avatar-sm
                        mr-3 chat-profile-picture_${item?.contact?.id?.user}"
                        src="${ item?.contact?.profilePicThumbObj?.eurl ?? './assets/img/avatar.png' }"
                        alt="avatar">
                        <div>
                        <p class="margin-auto fw-400 text-dark-75" >${ item?.contact?.formattedName?.length > 15 ? item?.contact?.formattedName?.substring(0, 15) + '...' : item?.contact?.formattedName } </p>
                        <div class="d-flex flex-row mt-1">
                            <span>
                                📱 ${ item?.contact.id?.user }
                            </span>
                            <span class="message-shortcut margin-auto
                            text-muted fs-13 ml-1 mr-4"> 
                        </div>
                        </div>
                    </div>
                    </div>
                    <div class="flex-shrink-0 margin-auto pl-2 pr-3">
                        <div class="d-flex flex-column">
                            <p class="text-muted text-right fs-13 mb-2">08:55</p>
                            
                            ${ item?.unreadCount > 0 ? `<span class="round badge badge-light-success margin-auto"> ${item?.unreadCount}</div>` : '' }
                        </div>
                    </div>

                </div>`

                // let content_html = `<li class="clearfix getChatByNumber" id="${item?.contact?.id?.user}" onclick="window.history.pushState({}, '', '?contact=${item?.contact?.id?.user}&session=${channelName}');">
                //     <img src="./assets/img/avatar.png" alt="avatar">
                //     <div class="about">
                //         <div class="name _${item?.contact?.id?.user}" title="${item?.contact?.formattedName}"> ${ item?.contact?.formattedName?.length > 15 ? item?.contact?.formattedName?.substring(0, 15) + '...' : item?.contact?.formattedName } </div>
                //         <div class="status"> <i class="fa fa-mobile"></i> ${item?.contact?.id?.user} </div>
                //     </div>
                // </li>`

                chatlist.innerHTML += content_html;
            }
        });

        //if contact parameter add class active
        if (contact) {
            document.getElementById(contact)?.classList.add('active');

            //click
            document.getElementById(contact)?.click();
            //fish scrool down

        }

    }else{
        chatlist.innerHTML = '';
        chatlist.innerHTML = 'Nenhum contato encontrado';
    }

});

getChatByNumber = async (number) => {

    const response = await fetch(`http://localhost:9090/api/chat/${number}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    console.log('data:', data);
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    if (data?.response?.data?.length > 0) {

        messages.innerHTML = '';

        data?.response?.data?.forEach((message) => {

            console.log('message:', message);
            
            if (message?.type === 'image') {
                let base64 = message?.base64;
                let img = document.createElement('img');
                img.src = base64;
                messageElement.appendChild(img);
                messages.appendChild(messageElement);
            }

            if (message?.type === 'text' || message?.type === 'chat') {
                messageElement.textContent = message?.mensagem

                if(message?.author == '.'){
                    
                    content_html = `<div class="left-chat-message fs-13 mb-2">
                        <p class="mb-0 mr-3 pr-4"> ${message?.mensagem} </p>
                        <div class="message-options">
                        <div class="message-time">06:15</div>
                        <div class="message-arrow"><i class="text-muted la
                            la-angle-down fs-17"></i></div>
                        </div>
                    </div>`
                    
                }else{

                    content_html = `<div class="d-flex flex-row-reverse mb-2">
                    <div class="right-chat-message fs-13 mb-2">
                      <div class="mb-0 mr-3 pr-4">
                        <div class="d-flex flex-row">
                          <div class="pr-2"> ${message?.mensagem} </div>
                          <div class="pr-4"></div>
                        </div>
                      </div>
                      <div class="message-options dark">
                        <div class="message-time">
                          <div class="d-flex flex-row">
                            <div class="mr-2">06:49</div>
                            <div class="svg15 double-check"></div>
                          </div>
                        </div>
                        <div class="message-arrow"><i class="text-muted
                            la la-angle-down fs-17"></i></div>
                      </div>
                    </div>
                  </div>`
                }

                messages.innerHTML += content_html;
            }

        });
    
        setTimeout(() => {
            $(".chat-history").scrollTop($(".chat-history")[0].scrollHeight);
        }, 1000);
    
    }

}

//getChatByNumber on click get chat by number
chatlist.addEventListener('click', async (event) => {

    $('.chat-history').scrollTop(0);

    $('.chat-history').css('background-color', '#fff');
    $('.chat-history').css('background-size', 'auto');
    $('.chat-history').css('background-image', 'none');
    $('.chat-history').css('opacity', '1');

    $('.chat-header').css('display', 'block');
    $('.chat-message').css('display', 'block');

    messages.innerHTML = '';

    document.querySelectorAll('.getChatByNumber').forEach((item) => {
        item.classList.remove('active');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const contact = urlParams?.get('contact')?.split(' ')?.join('-')?.toLowerCase()?.trim()?.toLowerCase();
    contact ? document.getElementById(contact)?.classList.add('active') : null;

    console.log('contact:', contact);
    await getChatByNumber(contact);

    let title = document.querySelector(`._${contact}`).title;
    document.getElementById("author").innerHTML = title;

    //copy src chat-profile-picto
    let src_avatar = $(`.chat-profile-picture_${contact}`).attr("src");
    //display block
    $(".chat-profile-pic").css("display", "block");
    $(".chat-profile-pic").attr("src", src_avatar);

    //lastMessage
    document.querySelector(`#lastMessage`).innerHTML = `${document.querySelector(`._${contact}`).title}`;

    event.preventDefault();

});

//press enter submit 
messageInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
       
        const message = messageInput.value;
        socket.emit('chat-send', message);
        messageInput.value = '';
        
    }
    $('.scrollable-chat-panel').perfectScrollbar('update');
});

socket.on('chat-send', (message) => {

    console.log('chat-send', message);
    let content_html = `<div class="left-chat-message fs-13 mb-2">
        <p class="mb-0 mr-3 pr-4"> ${message} </p>
        <div class="message-options">
        <div class="message-time">06:15</div>
        <div class="message-arrow"><i class="text-muted la
            la-angle-down fs-17"></i></div>
        </div>
    </div>`

    messages.innerHTML += content_html;

    $('.scrollable-chat-panel').perfectScrollbar('update');

});

socket.on('chat-received', (message) => {
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    if (message?.data?.type === 'image') {
        let base64 = message?.data?.base64;
        let img = document.createElement('img');
        img.src = base64;
        img.style.width = '100px';
        img.style.height = '100px';
        messageElement.appendChild(img);

        messages.appendChild(messageElement);

        $('.scrollable-chat-panel').perfectScrollbar('update');
    }

    if (message?.data?.type === 'text') {
        messageElement.textContent = message?.data?.content

        let content_html = `<div class="d-flex flex-row-reverse mb-2">
            <div class="right-chat-message fs-13 mb-2">
            <div class="mb-0 mr-3 pr-4">
                <div class="d-flex flex-row">
                <div class="pr-2"> ${message?.data?.content} </div>
                <div class="pr-4"></div>
                </div>
            </div>
            <div class="message-options dark">
                <div class="message-time">
                <div class="d-flex flex-row">
                    <div class="mr-2">06:49</div>
                    <div class="svg15 double-check"></div>
                </div>
                </div>
                <div class="message-arrow"><i class="text-muted
                    la la-angle-down fs-17"></i></div>
            </div>
            </div>
        </div>`
        
        messages.innerHTML += content_html;
        $('.scrollable-chat-panel').perfectScrollbar('update');

    }

    if (message?.data?.type === 'ppt' || message?.data?.type === 'audio') {
        let base64 = message?.data?.base64;
        let audio = document.createElement('audio');
        audio.src = base64;
        audio.controls = true;
        messageElement.appendChild(audio);
        messages.appendChild(messageElement);

        $('.scrollable-chat-panel').perfectScrollbar('update');

    }

    if (message?.data?.type === 'video') {
        let base64 = message?.data?.base64;
        let video = document.createElement('video');
        video.src = base64;
        video.controls = true;
        messageElement.appendChild(video);
        messages.appendChild(messageElement);

        $('.scrollable-chat-panel').perfectScrollbar('update');

    }

    //sticker 
    if (message?.data?.type === 'sticker') {
        let base64 = message?.data?.base64;
        let img = document.createElement('img');
        img.src = base64;

        img.style.width = '100px';
        img.style.height = '100px';
        
        let content_html = `<div class="d-flex flex-row-reverse mb-2">
            <div class="right-chat-message fs-13 mb-2">
            <div class="mb-0 mr-3 pr-4">
                <div class="d-flex flex-row">
                <div class="pr-2"> ${img.outerHTML} </div>
                <div class="pr-4"></div>
                </div>
            </div>
            <div class="message-options dark">
                <div class="message-time">
                <div class="d-flex flex-row">
                    <div class="mr-2">06:49</div>
                    <div class="svg15 double-check"></div>
                </div>
                </div>
                <div class="message-arrow"><i class="text-muted
                    la la-angle-down fs-17"></i></div>
            </div>
            </div>
        </div>`

        messages.innerHTML += content_html;
        $('.scrollable-chat-panel').perfectScrollbar('update');

    }

});