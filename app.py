from sqlalchemy import create_engine, text, MetaData, select
from sqlalchemy import Table, Column, Integer, String, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import Session

from flask import Flask, render_template, jsonify
from datetime import datetime

engine = create_engine("sqlite+pysqlite:///database.db", echo=True)


# setting up metadata
metadata_obj = MetaData()
Candidature = Table("candidature", 
                    metadata_obj,
                    Column("id", Integer,primary_key= True),
                    Column("entreprise", String(100)),
                    Column("ville", String(100)),
                    Column("pays", String(100)),
                    Column("poste", String(100)),
                    Column("lien_candidature", String(255)),
                    Column("source", String(100)),
                    Column("date_demande", Date),
                    Column("statut", String(25)),
                    Column("candidature_spontanee", Boolean)
                    )

Reponse = Table("reponse", 
            metadata_obj,
            Column("id", Integer,primary_key= True),
            Column("id_candidature", Integer, ForeignKey("candidature.id")),
            Column("date", Date),
            Column("contenu", Text)
            )

Entretien = Table("entretien", 
            metadata_obj,
            Column("id", Integer,primary_key= True),
            Column("id_candidature", Integer, ForeignKey("candidature.id")),
            Column("date", Date),
            Column("type", Text)
            )



app = Flask(__name__)

@app.route('/')
def index():
    with Session(engine) as session:
        select(Reponse)
        select(Entretien)
        stmt = select(Candidature).order_by(Candidature.c.date_demande.desc())
        candidatures = session.execute(stmt).all()

    return render_template("index.html", candidatures = candidatures)

@app.route('/entretiens/<int:id_candidature>')
def get_entretiens(id_candidature):
    with Session(engine) as session:
        stmt = select(Entretien).where(Entretien.c.id_candidature == id_candidature)
        entretiens = session.execute(stmt).all()
        return jsonify([{'type': row.type, 'date' : row.date.strftime("%d/%m/%Y")} for row in entretiens])
    
@app.route('/reponses/<int:id_candidature>')
def get_reponses(id_candidature):
    with Session(engine) as session:
        stmt = select(Reponse).where(Reponse.c.id_candidature == id_candidature)
        reponses = session.execute(stmt).all()
        return jsonify([{'contenu': row.contenu, 'date': row.date.strftime("%d/%m/%Y")} for row in reponses])
    
@app.route('/date/<int:id_candidature>')
def get_date(id_candidature):
    with Session(engine) as session:
        stmt = select(Candidature).where(Candidature.c.id == id_candidature)
        resp = session.execute(stmt).all()
        return jsonify(resp[0].date_demande.strftime("%d/%m/%Y"))
        

if __name__ == '__main__':
    metadata_obj.create_all(engine)
    app.run()