from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
import os

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, 'database.db')

db = SQLAlchemy(app)

class Candidature(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    entreprise = db.Column(db.String(100))
    ville = db.Column(db.String(100))
    pays = db.Column(db.String(100))
    poste = db.Column(db.String(100))    
    lien_candidature = db.Column(db.String(255))
    source = db.Column(db.String(100))
    date_demande = db.Column(db.Date)
    statut = db.Column(db.String(25))
    candidature_spontanee = db.Column(db.Boolean)

    
@app.route("/")
def index():
    with app.app_context():
        db.create_all()

    candidatures = Candidature.query.all()
    return render_template('index.html', candidatures=candidatures)
    

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)