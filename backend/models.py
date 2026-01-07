from typing import List, Optional, Dict, Any, Union, Generic, TypeVar
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

T = TypeVar('T')

class FieldData(BaseModel, Generic[T]):
    value: T
    confidence: float = 0.0
    source: List[str] = []

class KeyPerson(BaseModel):
    name: str
    title: str = ""
    role_category: str = ""

class CompanyProfile(BaseModel):
    company_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Core Fields with Metadata
    company_name: FieldData[str] = FieldData(value="")
    domain: FieldData[str] = FieldData(value="")
    logo_url: FieldData[str] = FieldData(value="")
    industry: FieldData[str] = FieldData(value="")
    sub_industry: FieldData[str] = FieldData(value="")
    
    short_description: FieldData[str] = FieldData(value="")
    long_description: FieldData[str] = FieldData(value="")
    
    products_services: FieldData[List[str]] = FieldData(value=[])
    
    headquarters: FieldData[str] = FieldData(value="")
    full_address: FieldData[str] = FieldData(value="")
    office_locations: FieldData[List[str]] = FieldData(value=[])
    
    key_people: FieldData[List[KeyPerson]] = FieldData(value=[])
    
    contact_email: FieldData[str] = FieldData(value="")
    contact_phone: FieldData[str] = FieldData(value="")
    sales_phone: FieldData[str] = FieldData(value="")
    fax: FieldData[str] = FieldData(value="")
    mobile: FieldData[str] = FieldData(value="")
    other_numbers: FieldData[str] = FieldData(value="")
    contact_page: FieldData[str] = FieldData(value="")
    
    hours_of_operation: FieldData[str] = FieldData(value="")
    hq_indicator: FieldData[str] = FieldData(value="")
    
    tech_stack_signals: FieldData[List[str]] = FieldData(value=[])
    founded_year: FieldData[Optional[str]] = FieldData(value=None)
    
    missing_fields: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class GraphNode(BaseModel):
    id: str
    label: str
    type: str

class GraphEdge(BaseModel):
    source: str
    target: str
    label: str

class KnowledgeGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ProcessingResponse(BaseModel):
    profile: CompanyProfile
    graph: KnowledgeGraph

class BatchStatus(BaseModel):
    total: int
    processed: int
    failed: int
    current_company: Optional[str] = None
    results: List[Dict[str, Any]] = []
