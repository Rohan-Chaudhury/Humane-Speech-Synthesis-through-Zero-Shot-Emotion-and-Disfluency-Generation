class Chatbox {
  constructor() {
    this.args = {
      // openButton: document.querySelector('.chatbox__button'),
      chatBox: document.querySelector('.chatbox__support'),
      sendButton: document.querySelector('.send__button'),
      editButton: document.querySelector('.edit__button'),

    }
    var current_url = location.pathname
    this.state = true;
    this.messages = [];
  }

  display() {
    const { chatBox, chatBox_footer, sendButton, editButton } = this.args;

    // openButton.addEventListener('click', () => this.toggleState(chatBox))

    sendButton.addEventListener('click', () => this.onSendButton(chatBox))

    // editButton.addEventListener('click', () => this.oneditButton(chatBox))

    const node = chatBox.querySelector('input');
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox)
      }
    })
    // const node2 = chatBox.getElementsByClassName('uil-pen');
    // node2.addEventListener("click", () => {

    //   }
  }

  

  onSendButton(chatbox) {
    var textField = chatbox.querySelector('input');
    let text1 = textField.value
    if (text1 === "") {
      return;
    }
    var current_url = location.pathname
    let msg1 = { name: "User", message: text1 }
    this.messages.push(msg1);
    textField.value = ''
    this.updateChatText(chatbox)
    
    if (current_url == "/bat_chat1") {
      fetch('./predict1', {
          method: 'POST',
          body: JSON.stringify({ message: text1 }),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
        })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer};
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''
    
          }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
      
    }
    else {
      fetch('./predict2', {
          method: 'POST',
          body: JSON.stringify({ message: text1 }),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
        })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer};
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''
    
          }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }
    
  }

  updateChatText(chatbox) {
    var html = '';
    this.messages.slice().reverse().forEach(function (item, index) {
      if (item.name === "Sam") {
        html += '<form action="/" method="POST"><div class="messages__item messages__item--visitor">' + item.message + '</br></div></form>'

      }
      else {
        html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
      }
    });

    const chatmessage = chatbox.querySelector('.chatbox__messages');
    chatmessage.innerHTML = html;
  }
}




const chatbox = new Chatbox();
chatbox.display();