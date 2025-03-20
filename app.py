from sqlalchemy import create_engine, text, MetaData, select, func, distinct, insert, delete
from sqlalchemy import Table, Column, Integer, String, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import Session

from flask import Flask, render_template, jsonify, request
from datetime import datetime
from datetime import date


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
        stmt4 = select(distinct(Candidature.c.ville)).order_by(Candidature.c.ville.asc())
        stmt5 = select(distinct(Candidature.c.entreprise)).order_by(Candidature.c.entreprise.asc())

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
        villes = session.execute(stmt4).scalars().all()
        entreprises = session.execute(stmt5).scalars().all()

        today_date = date.today()

        return render_template("index.html", 
                               candidatures = candidatures_dict, 
                               sources = sources, 
                               villes = villes, 
                               entreprises = entreprises,
                               nmb_c = nmb_c, 
                               date_today = today_date)

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
    
@app.route('/add_candidature', methods=['POST'])
def add_candidature():
    entreprise = request.form.get('Entreprise')
    lien = request.form.get('Lien candidature')
    source = request.form.get('Source')
    poste = empty_to_null(request.form.get('Poste'))
    pays = empty_to_null(request.form.get('Pays'))
    ville = empty_to_null(request.form.get('Ville'))
    date_demande_str = request.form.get('Date de demande')
    date_demande = datetime.strptime(date_demande_str, "%Y-%m-%d").date() if date_demande_str else None
    statut = request.form.get('Statut').capitalize()
    candidature_spontanee = poste == ""

    with Session(engine) as session:
        stmt = insert(Candidature).values(
                            entreprise = entreprise, 
                            ville = ville, 
                            pays = pays,  
                            poste = poste, 
                            lien_candidature = lien, 
                            source = source, 
                            date_demande = date_demande, 
                            statut = statut, 
                            candidature_spontanee = candidature_spontanee,
                            dernier_maj = date_demande
                            )
        session.execute(stmt)
        session.commit()
        
    return jsonify({"message": "Candidature added successfully"}), 201

@app.route('/delete_candidature', methods=['POST'])
def delete_candidature():
    id_candidature = request.form.get('ID')

    with Session(engine) as session:
        stmt = delete(Candidature).where(Candidature.c.id == id_candidature)
        session.execute(stmt)
        session.commit()
        
    return jsonify({"message": "Candidature removed successfully"}), 201

def empty_to_null(mot):
    if (mot == ""):
        return None
    else:
        return mot
    

if __name__ == '__main__':
    metadata_obj.create_all(engine)
    app.run(host='0.0.0.0', debug=True)