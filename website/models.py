from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func
from datetime import datetime


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(10000))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key = True, nullable = True)
    request_text = db.Column(db.TEXT)
    response_text = db.Column(db.TEXT)
    date_created = db.Column(db.DateTime, default= datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class edit_Chat(db.Model):
    id = db.Column(db.Integer, primary_key = True, nullable = True)
    request_text = db.Column(db.TEXT)
    response_text = db.Column(db.TEXT)
    edit_response_text = db.Column(db.TEXT)
    date_created = db.Column(db.DateTime, default= datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    name = db.Column(db.String(150))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(150))
    profession = db.Column(db.String(150))
    notes = db.relationship('Note', backref='user_')
    chats = db.relationship('Chat', backref='user_', lazy='dynamic')
    edit_chats = db.relationship('edit_Chat', backref='user_')
    memory = db.relationship('PastorMemory', backref='user', uselist=False)

class PastorMemory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    counter_zimmerman = db.Column(db.Integer)
    counter_zimmerman_new = db.Column(db.Integer)
    prompt_zimmerman_new = db.Column(db.String(500*15)) # adjust size as necessary
    prompt_zimmerman_second = db.Column(db.String(500*15)) # adjust size as necessary
