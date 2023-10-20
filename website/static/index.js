function deleteNote(noteId) {
  fetch("/delete-note", {
    method: "POST",
    body: JSON.stringify({ noteId: noteId }),
  }).then((_res) => {
    window.location.href = "/history";
  });
}

function editChat(chatId) {
  fetch("/edit-chat", {
    method: "POST",
    body: JSON.stringify({ chatId: chatId }),
  })
}

class Chatbox {
  constructor() {
    this.args = {
      // openButton: document.querySelector('.chatbox__button'),
      chatBox: document.querySelector('.chatbox__support'),
      sendButton: document.querySelector('.send__button'),
      resetButton: document.querySelector('.reset__button'),
      editButton: document.querySelector('.edit__button'),

    }

    this.state = true;
    this.messages = [];
  }

  display() {
    const { chatBox, chatBox_footer, sendButton, editButton,  resetButton } = this.args;

    // openButton.addEventListener('click', () => this.toggleState(chatBox))

    sendButton.addEventListener('click', () => this.onSendButton(chatBox))
    resetButton.addEventListener('click', () => this.onResetButton(chatBox))

    // editButton.addEventListener('click', () => this.oneditButton(chatBox))

    const node = chatBox.querySelector('input');
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox)
      }
    })
  }
  onSendButton(chatbox) {
    var textField = chatbox.querySelector('input');
    let text1 = textField.value
    if (text1 === "") {
        return;
    }

    let msg1 = { name: "User", message: text1 }
    this.messages.push(msg1);
    textField.value = ''


    // Add "Pastor is typing..." message before sending the request
    let typingMessage = { name: "Sam", message: "Patient is typing...", isTyping: true, class: "blink" };
    this.messages.push(typingMessage);
    this.updateChatText(chatbox)

    // // Add "Pastor is typing..." message or loading spinner here
    // let typingMessage = document.createElement("div");
    // typingMessage.classList.add("messages__item", "messages__item--visitor", "typing");
    // typingMessage.innerHTML = "Pastor is typing...";
    // chatbox.querySelector('.chatbox__messages').appendChild(typingMessage);

    fetch('./predict', {
        method: 'POST',
        body: JSON.stringify({ message: text1 }),
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: "Sam", message: r.answer, id: r.id};
            // Remove "Pastor is typing..." message or loading spinner here
            this.messages.pop();
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            

      }).catch((error) => {
        console.error('Error:', error);
        this.updateChatText(chatbox)
        textField.value = ''
      });
  }

  updateChatText(chatbox) {
    var html = '';
    this.messages.slice().reverse().forEach(function (item, index) {
      if (item.isTyping) {
        html += '<div class="messages__item messages__item--visitor ' + item.class + '">' + item.message + '</div>'
    }

      if (item.name === "Sam" && !item.isTyping) {
        html += '<form action="/" method="POST"><div class="messages__item messages__item--visitor">' + item.message + '</br><a class="uil uil-pen edit__button" href="/update/' + item.id + '" target="_blank" rel="noopener noreferrer"> Edit</a></div></form>'
        
      }
      else if (!item.isTyping){
        html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
      }
    });

    const chatmessage = chatbox.querySelector('.chatbox__messages');
    chatmessage.innerHTML = html;
  }
  onResetButton(chatbox) {
    var textField = chatbox.querySelector('input');
    let text1 = '<reset>'

    let msg1 = { name: "User", message: text1 }
    this.messages.push(msg1);
    textField.value = ''

    let typingMessage = { name: "Allen", message: "Resetting...", isTyping: true, class: "blink" };
    this.messages.push(typingMessage);
    this.updateChatText(chatbox)

    fetch('./predict', {
        method: 'POST',
        body: JSON.stringify({ message: text1 }),
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: "Sam", message: r.answer, id: r.id };
            this.messages.pop();
            this.messages.push(msg2);
            this.updateChatText(chatbox)
        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
        });
  }
}


const chatbox = new Chatbox();
chatbox.display();
chatbox.edit();

// window.addEventListener('load', (e) => {
//   e.preventDefault();
//   const chatmessages = document.querySelector('#input');
//   chatmessages.addEventListener('click', (event) => {
//     if (event.target.tagName === "button"){
//       const button = event.target;
//       const answerdiv = button.parentNode;
//       const messages = answerdiv.parentNode;
//         if (button.textContent.toLowerCase() === ' edit') {
//           const span = answerdiv.firstElementChild
//           const input = document.createElement('input');
//           input.type = 'text';
//           input.value = span.textContent;
//           answerdiv.insertBefore(input, span);
//           answerdiv.removeChild(span);
//           button.textContent = ' Save';
//         } else if (button.textContent.toLowerCase() === ' save') {
//         const input = answerdiv.firstElementChild
//         const span = document.createElement('span');
//         span.textContent = input.value;
//         answerdiv.insertBefore(span, input);
//         answerdiv.removeChild(input);
//         button.textContent = ' Edit';
//         }
//       }})
//   })

// const chatmessages = document.querySelector('#input');
// chatmessages.addEventListener('click', (event) => {
//   if (event.target.tagName === "button"){
//     const button = event.target;
//     const answerdiv = button.parentNode;
//     const messages = answerdiv.parentNode;
//       if (button.textContent.toLowerCase() === ' edit') {
//         const span = answerdiv.firstElementChild
//         const input = document.createElement('input');
//         input.type = 'text';
//         input.value = span.textContent;
//         answerdiv.insertBefore(input, span);
//         answerdiv.removeChild(span);
//         button.textContent = ' Save';
//       } else if (button.textContent.toLowerCase() === ' save') {
//       const input = answerdiv.firstElementChild
//       const span = document.createElement('span');
//       span.textContent = input.value;
//       answerdiv.insertBefore(span, input);
//       answerdiv.removeChild(input);
//       button.textContent = ' Edit';
//       }
//     }})

    // const node2 = chatBox.getElementsByClassName('uil-pen');
    // node2.addEventListener("click", () => {

    //   }


  // edit() {
  //   const { chatBox, editButton } = this.args;

  //   // openButton.addEventListener('click', () => this.toggleState(chatBox))

  //   // sendButton.addEventListener('click', () => this.onSendButton(chatBox))

  //   editButton.addEventListener('click', () => this.onSendButton(chatBox))

  //   const node = chatBox.querySelector('edit__button');
  //   node.addEventListener("click", () => {
  //     this.oneditButton(chatBox)
  //     })
  //   }



    // const node2 = chatBox.getElementsByClassName('uil-pen');
    // node2.addEventListener("click", () => {

    //   }
  

  // toggleState(chatbox) {
  //     this.state = !this.state;

  //     // show or hides the box
  //     if(this.state) {
  //         chatbox.classList.add('chatbox--active')
  //     } else {
  //         chatbox.classList.remove('chatbox--active')
  //     }
  // }


  // oneditButton(chatbox) {
  //   const task_input_el = chatbox.querySelector('aianswer');
  //   const task_edit_el = chatbox.querySelector('uil uil-pen');

  //   if (task_edit_el.innerText.toLowerCase() == "edit") {
  //     task_edit_el.innerText = "Save";
  //     task_input_el.removeAttribute("readonly");
  //     task_input_el.focus();
  //   } else {
  //     task_edit_el.innerText = "Edit";
  //     task_input_el.setAttribute("readonly", "readonly");
  //   }
  // }