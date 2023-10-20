from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
from flask_ngrok import run_with_ngrok
from pyngrok import ngrok


db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'softlab'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import Note, Chat, edit_Chat, User, PastorMemory

    create_database(app)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(id)

    return app

def create_database(app):
    if not path.exists('instance/' + DB_NAME):
        with app.app_context():
            db.create_all()
        print('Created Database!')
    else:
        print('Database already exists!')

