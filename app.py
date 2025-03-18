from sqlalchemy import create_engine, text, MetaData, select, func, distinct
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
                    Column("candidature_spontanee", Boolean),
                    Column("dernier_maj", Date)
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
        stmt = select(Candidature).order_by(Candidature.c.date_demande.desc())
        stmt2 = select(func.count(Candidature.c.id))
        stmt3 = select(distinct(Candidature.c.source)).order_by(Candidature.c.source.asc())

        candidatures = session.execute(stmt).all()
        candidatures_dict = [
            {
                'id': row.id,
                'entreprise': row.entreprise,
                'ville': row.ville,
                'pays': row.pays,
                'poste': row.poste,
                'lien_candidature': row.lien_candidature,
                'source': row.source,
                'date_demande': row.date_demande.strftime("%d/%m/%Y"),
                'statut': row.statut,
                'candidature_spontanee': row.candidature_spontanee,
                'dernier_maj': row.dernier_maj.strftime("%d/%m/%Y") if row.dernier_maj else None
            }
            for row in candidatures
        ]
        nmb_c = session.execute(stmt2).scalar()
        sources = session.execute(stmt3).scalars().all()

        return render_template("index.html", candidatures = candidatures_dict, sources = sources, nmb_c = nmb_c)

# returns all needed entretiens info for a candidature to flask app
@app.route('/entretiens/<int:id_candidature>')
def get_entretiens(id_candidature):
    with Session(engine) as session:
        stmt = select(Entretien).where(Entretien.c.id_candidature == id_candidature)
        entretiens = session.execute(stmt).all()
        return jsonify([{'type': row.type, 'date' : row.date.strftime("%d/%m/%Y")} for row in entretiens])
    
# returns all needed reponses info for a candidature to flask app
@app.route('/reponses/<int:id_candidature>')
def get_reponses(id_candidature):
    with Session(engine) as session:
        stmt = select(Reponse).where(Reponse.c.id_candidature == id_candidature)
        reponses = session.execute(stmt).all()
        return jsonify([{'contenu': row.contenu, 'date': row.date.strftime("%d/%m/%Y")} for row in reponses])

if __name__ == '__main__':
    metadata_obj.create_all(engine)
    app.run(debug=True)