from sqlalchemy import create_engine, text, MetaData, select
from sqlalchemy import Table, Column, Integer, String, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import Session

from flask import Flask, render_template

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
        stmt = select(Candidature)
        candidatures = session.execute(stmt).all()

    return render_template("index.html", candidatures = candidatures)

if __name__ == '__main__':
    metadata_obj.create_all(engine)
    app.run()