from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for
from flask_login import login_required, current_user
from . import db
import json
from .models import *
from sqlalchemy import desc
from time import sleep
from sqlalchemy import func, extract
from datetime import date
# from transformers import pipeline
from flask import abort, Flask, render_template, request
from werkzeug.security import generate_password_hash
from .gpt import zimmerman_chat
views = Blueprint('views', __name__)


@views.route('/', methods=['GET'])
@login_required
def home():
    return render_template("home.html", user=current_user)

@views.route('/predict', methods=['POST'])
def predict():
    question = request.get_json().get("message")

    dialog = []
    today = date.today()
    print(today)
    user_chats = Chat.query.filter(
        Chat.user_id == current_user.id,
        extract('day', Chat.date_created) == today.day,
        extract('month', Chat.date_created) == today.month,
        extract('year', Chat.date_created) == today.year
        ).all()
    if not user_chats:
        dialog = []
        print('no chat history')
    else:
        for chat in user_chats:
            if chat.request_text == '<reset>':
                dialog = []
            else:
                dialog.append(chat.request_text)
                dialog.append(chat.response_text)
        print('chat history loaded')
    

    dialog.append(question)
    response = zimmerman_chat(question)
    print(f'GPT: {response}')
       
    dialog.append(response)

    new_message = Chat(request_text = question, response_text = response, user_id=current_user.id) 
    
    try:
        db.session.add(new_message)
        db.session.commit()
        message = {"answer": response, "id": new_message.id}

        return jsonify(message)
    except:
        return jsonify("Error creating"), print("Error creating")

@views.route('/history', methods=['POST','GET'])
@login_required
def index_history():
    if request.method == 'POST':
        note = request.form.get('note')

        if len(note) < 1:
            flash('Note is too short!', category='error')
            notes = Note.query.order_by(desc(Note.id)).all()
            messages = Chat.query.order_by(desc(Chat.user_id)).all()
        else:
            new_note = Note(data=note, user_id=current_user.id)
            db.session.add(new_note)
            db.session.commit()
            flash('Note added!', category='success')
            notes = Note.query.order_by(desc(Note.id)).all()
            messages = Chat.query.order_by(desc(Chat.user_id)).all()
            # return render_template("history.html", notes)
    else:
        messages = Chat.query.order_by(desc(Chat.user_id)).all()
        notes = Note.query.order_by(desc(Note.id)).all()

    return render_template("history.html", messages = messages, notes=notes, user=current_user)

@views.route('/edit_chat', methods=['GET'])
@login_required
def index_edit_history():

    if current_user.email != 'admin@tamu.edu':
        abort(403)
    
    messages = edit_Chat.query.order_by(desc(edit_Chat.date_created)).all()
    return render_template("edit_chat.html", messages = messages, user=current_user)

@views.route('/train/<int:id>', methods=["POST", "GET"])
def train(id):
    message_to_edit = edit_Chat.query.get_or_404(id)

    question = message_to_edit.request_text
    answer = message_to_edit.edit_response_text
    try:
        tune(question, answer)
        flash('AI-Model Update Complete', category='success')
        db.session.delete(message_to_edit)
        db.session.commit()
        # close the window
        return redirect('/edit_chat')
    except Exception as e:
        flash('An error occurred while updating the AI model', category='error')
        return redirect('/edit_chat')

@views.route('/delete/<int:id>')
def delete(id):
    message_to_delete = Chat.query.get_or_404(id)

    try: 
        db.session.delete(message_to_delete)
        db.session.commit()
        return redirect('/history')
    except:
        return 'There was a problem deleting that message'

@views.route('/delete-note', methods=['POST'])
def delete_note():
    note = json.loads(request.data)
    noteId = note['noteId']
    note = Note.query.get(noteId)
    if note:
        db.session.delete(note)
        db.session.commit()

    return jsonify({})

@views.route('/update/<int:id>', methods=['POST', 'GET'])
def update(id):
    message_to_update = Chat.query.get_or_404(id)
    if request.method == "POST":
        try:
            edited_answer = request.form['Sam']
            editchat = edit_Chat(request_text = message_to_update.request_text, response_text = message_to_update.response_text, edit_response_text = edited_answer, user_id=current_user.id)
            db.session.add(editchat)
            db.session.commit()
            flash('Edit successful, close this window and proceed', category='success')
            return redirect('/history')
        except:
            return 'There was a problem editing that message'
    else:
        return render_template('update.html', message_to_update=message_to_update, user=current_user)

@views.route('/reset_passwords', methods=['GET', 'POST'])
def reset_passwords():
    # Only allow access to the admin user
    if current_user.email != 'admin@tamu.edu':
        abort(403)

    # If the form is submitted, reset the password for the selected user
    if request.method == 'POST':
        # Get the email of the selected user from the request parameters
        email = request.form['email']

        # Look up the user in the database and reset their password
        user = User.query.filter_by(email=email).first()
        if user:
            user.password = generate_password_hash('reset', method='sha256')
            db.session.commit()
            flash(f'Password reset for {email}.', category='success')
            return redirect('/reset_passwords')
        else:
            flash(f'User with email {email} not found.', category='error')
            return redirect('/reset_passwords')

    # If the form is not submitted, show a list of all user emails
    users = User.query.all()
    emails = [user.email for user in users]
    return render_template('reset_passwords.html', emails=emails, user=current_user)