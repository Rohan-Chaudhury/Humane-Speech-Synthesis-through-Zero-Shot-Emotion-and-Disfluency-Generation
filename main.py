from website import create_app
from flask_ngrok import run_with_ngrok
from pyngrok import ngrok

app = create_app()

# run_with_ngrok(app)
if __name__ == '__main__':
    print('---Running Server---')
    app.run(debug=True)

    # app.run()
