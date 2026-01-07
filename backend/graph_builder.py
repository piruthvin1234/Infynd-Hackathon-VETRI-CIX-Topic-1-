from typing import Dict, Any
from models import KnowledgeGraph, GraphNode, GraphEdge, CompanyProfile

def build_knowledge_graph(profile: CompanyProfile) -> KnowledgeGraph:
    nodes = []
    edges = []
    
    # Helper to safely get value
    c_name = profile.company_name.value if profile.company_name else "Unknown Company"
    
    # Company Node
    nodes.append(GraphNode(id="company", label=c_name, type="company"))
    
    # Industry
    if profile.industry and profile.industry.value:
        nodes.append(GraphNode(id="industry", label=profile.industry.value, type="industry"))
        edges.append(GraphEdge(source="company", target="industry", label="operates in"))
        
    # Products
    if profile.products_services and profile.products_services.value:
        for i, product in enumerate(profile.products_services.value):
            pid = f"prod_{i}"
            nodes.append(GraphNode(id=pid, label=product, type="product"))
            edges.append(GraphEdge(source="company", target=pid, label="offers"))
        
    # Locations (Headquarters)
    if profile.headquarters and profile.headquarters.value:
        nodes.append(GraphNode(id="hq", label=profile.headquarters.value, type="location"))
        edges.append(GraphEdge(source="company", target="hq", label="headquartered in"))
    
    # Locations (Offices)
    if profile.office_locations and profile.office_locations.value:
        for i, loc in enumerate(profile.office_locations.value):
            lid = f"loc_{i}"
            nodes.append(GraphNode(id=lid, label=loc, type="location"))
            edges.append(GraphEdge(source="company", target=lid, label="office in"))
        
    # People
    if profile.key_people and profile.key_people.value:
        for i, person in enumerate(profile.key_people.value):
            pid = f"person_{i}"
            # Handle Pydantic model or dict
            p_name = person.name if hasattr(person, 'name') else person.get('name', '')
            p_title = person.title if hasattr(person, 'title') else person.get('title', '')
            
            label = f"{p_name} ({p_title})" if p_title else p_name
            nodes.append(GraphNode(id=pid, label=label, type="person"))
            edges.append(GraphEdge(source="company", target=pid, label="employs"))
        
    # Tech Stack
    if profile.tech_stack_signals and profile.tech_stack_signals.value:
        for i, tech in enumerate(profile.tech_stack_signals.value):
            tid = f"tech_{i}"
            nodes.append(GraphNode(id=tid, label=tech, type="tech"))
            edges.append(GraphEdge(source="company", target=tid, label="uses"))
        
    return KnowledgeGraph(nodes=nodes, edges=edges)
