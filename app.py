import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

# Intentar cargar variables de entorno desde el archivo .env (en entorno local)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app) # Permite que tu HTML se comunique con Python sin errores de CORS

# LÓGICA DE USUARIOS Y CONTRASEÑAS
USERS = {
    'Admin': {'role': 'admin', 'pass': 'AdminBarónD'},
    'Eliu': {'role': 'asesor', 'pass': 'ELIU'},
    'Cesar Montes': {'role': 'asesor', 'pass': 'CESAR MONTES'},
    'Danelys Ruiz': {'role': 'asesor', 'pass': 'DANELYS RUIZ'},
    'Eliuth': {'role': 'asesor', 'pass': 'ELIUTH'},
    'Alejandro': {'role': 'asesor', 'pass': 'ALEJANDRO'},
    'Josué': {'role': 'asesor', 'pass': 'JOSUÉ'}
}

# --- CONEXIÓN A MONGODB ATLAS ---
def get_cotizaciones_collection():
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise Exception("Error: Falta configurar la variable MONGO_URI en el archivo .env o en el panel de Render.")
    
    db_name = os.getenv("MONGO_DB_NAME", "hamilton_cotizador_proyectos")
    
    # Reutilizamos el cliente global para evitar abrir conexiones múltiples por petición
    if not hasattr(get_cotizaciones_collection, 'client') or get_cotizaciones_collection.client is None:
        get_cotizaciones_collection.client = MongoClient(mongo_uri)
        
    db = get_cotizaciones_collection.client[db_name]
    return db["cotizaciones"]

# --- RUTAS ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = data.get('user')
    password = data.get('password')
    if user in USERS and USERS[user]['pass'] == password:
        return jsonify({"success": True, "role": USERS[user]['role']})
    return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"}), 401


@app.route('/api/cotizaciones', methods=['GET', 'POST'])
def handle_cotizaciones():
    try:
        collection = get_cotizaciones_collection()
        
        if request.method == 'GET':
            # 1. Traer todas las cotizaciones de MongoDB ordenadas por fecha reciente
            cotizaciones_db = list(collection.find().sort("fecha", -1))
            
            # 2. Aseguramos compatibilidad y formatos para el frontend en React
            for cot in cotizaciones_db:
                # Convertir el _id nativo de MongoDB a string
                cot['_id'] = str(cot['_id'])
                
                # Garantizar campo 'id' principal si no viniera
                if 'id' not in cot:
                    cot['id'] = cot['_id']
                
                # Garantizar array de itemsData (por defecto vacío si recién se creó sin ítems)
                if 'itemsData' not in cot:
                    cot['itemsData'] = []
                    
                # Formatear la fecha para que React la entienda como cadena ISO
                if isinstance(cot.get('fecha'), datetime):
                    cot['fecha'] = cot['fecha'].strftime('%Y-%m-%dT%H:%M:%S.000Z')
                    
            return jsonify(cotizaciones_db)

        elif request.method == 'POST':
            new_quote = request.json
            quote_id = str(new_quote.get('id', ''))
            
            if not quote_id:
                import uuid
                quote_id = str(uuid.uuid4())
                new_quote['id'] = quote_id
            
            # Usamos el id del frontend también como _id para evitar duplicados si se re-envía
            new_quote['_id'] = quote_id
            
            # Aseguramos que los ítems vengan en su propiedad natural (en MongoDB se guardan anidados directamente)
            if 'itemsData' not in new_quote:
                new_quote['itemsData'] = []

            # replace_one con upsert=True guarda el documento o lo actualiza de forma limpia
            collection.replace_one({"_id": quote_id}, new_quote, upsert=True)
            
            return jsonify({"success": True, "message": "Cotización guardada exitosamente en MongoDB Atlas"})
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/cotizaciones/<quote_id>', methods=['PUT'])
def update_cotizacion(quote_id):
    data = request.json
    try:
        collection = get_cotizaciones_collection()
        update_fields = {}
        
        if 'estadoLead' in data:
            update_fields['estadoLead'] = data['estadoLead']
        if 'montoVendido' in data:
            update_fields['montoVendido'] = data['montoVendido']
        
        if not update_fields:
            return jsonify({"success": False, "message": "No hay campos para actualizar"}), 400
            
        result = collection.update_one({"_id": str(quote_id)}, {"$set": update_fields})
        if result.matched_count == 0:
            # Intentar buscar por el campo 'id' si el '_id' no era igual
            result = collection.update_one({"id": str(quote_id)}, {"$set": update_fields})
            
        if result.matched_count > 0:
            return jsonify({"success": True, "message": "Cotización actualizada en MongoDB Atlas"})
        else:
            return jsonify({"success": False, "message": "Cotización no encontrada"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/cotizaciones/<quote_id>', methods=['DELETE'])
def delete_cotizacion(quote_id):
    try:
        collection = get_cotizaciones_collection()
        result = collection.delete_one({"_id": str(quote_id)})
        
        if result.deleted_count == 0:
            # Intentar eliminar por el campo 'id'
            result = collection.delete_one({"id": str(quote_id)})
            
        if result.deleted_count > 0:
            return jsonify({"success": True, "message": "Cotización eliminada de MongoDB Atlas"})
        else:
            return jsonify({"success": False, "message": "Cotización no encontrada"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
    # Usamos port 10000 para mantener compatibilidad con Render y el entorno local
    app.run(debug=True, port=10000)
