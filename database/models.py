import datetime
import enum

from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import  Column, String, Integer, Boolean, Text, ForeignKey, Enum, DateTime, Interval

from . import Base

class MessageType(enum.Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"

class ActivityType(enum.Enum):
    PROMOTION = "Promotion"
    REMAINDER = "Remainder"

class IntervalUnit(enum.Enum):
    MINUTES = "MINUTES"
    HOURS = "HOURS"
    DAYS = "DAYS"

class User(Base, SerializerMixin):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=False, unique=True)
    role = Column(String, nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
    modified_by = Column(String, ForeignKey("users.id"))
    modified_at = Column(DateTime, onupdate=datetime.datetime.now)

class Flow(Base, SerializerMixin):
    __tablename__ = "flows"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    trigger = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
    modified_by = Column(String, ForeignKey("users.id"))
    modified_at = Column(DateTime, onupdate=datetime.datetime.now)
    flow_file = Column(String, nullable=False)

class Promotion(Base, SerializerMixin):
    __tablename__ = "promotions"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    connected_flow = Column(String, ForeignKey("flows.id"))
    promotion_type = Column(String, nullable=False)
    header_message = Column(String, nullable=False)
    footer_message = Column(String, nullable=True)
    message_body_type = Column(Enum(MessageType), nullable=False)
    message_body = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
    modified_by = Column(String, ForeignKey("users.id"))
    modified_at = Column(DateTime, onupdate=datetime.datetime.now)
    excel_file = Column(String, nullable=True)

class Remainder(Base, SerializerMixin):
    __tablename__ = "remainders"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    connected_flow = Column(String, ForeignKey("flows.id"))
    remainder_type = Column(String, nullable=False)
    header_message = Column(String, nullable=False)
    footer_message = Column(String, nullable=True)
    message_body_type = Column(Enum(MessageType), nullable=False)
    message_body = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
    modified_by = Column(String, ForeignKey("users.id"))
    modified_at = Column(DateTime, onupdate=datetime.datetime.now)
    excel_file = Column(String, nullable=True)

class Campaign(Base, SerializerMixin):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    schedule_at = Column(DateTime, nullable=False)
    activity_type = Column(Enum(ActivityType), nullable=False)
    activity_id = Column(String, nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
    modified_by = Column(String, ForeignKey("users.id"))
    modified_at = Column(DateTime, onupdate=datetime.datetime.now)
    last_run_time = Column(DateTime)
    last_run_by = Column(String, ForeignKey("users.id"))
    total_runs = Column(Integer, default=0)
    repeat_count = Column(Integer, default=0)
    repeat_interval_value = Column(Integer, nullable=True) 
    repeat_interval_unit = Column(Enum(IntervalUnit), nullable=True)
    customer_excel_file = Column(String, nullable=True)


class CampaignMetrics(Base, SerializerMixin):
    __tablename__ = "campaign_metrics"

    id = Column(String, primary_key=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    total_users_targeted = Column(Integer, default=0)
    messages_attempted = Column(Integer, default=0)
    messages_failed = Column(Integer, default=0)
    messages_delivered = Column(Integer, default=0)
    messages_unread = Column(Integer, default=0)
    flow_completed = Column(Integer, default=0)
    flow_cutoffs = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.now)

class UserCampaignInteraction(Base, SerializerMixin):
    __tablename__ = "user_campaign_interactions"

    id = Column(String, primary_key=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    phone_no = Column(String, nullable=False)
    flow_id = Column(String, ForeignKey("flows.id"))
    flow_completed = Column(Boolean, default=False)
    cutoff_step = Column(String, nullable=True)
    total_messages_sent = Column(Integer, default=0)
    total_messages_delivered = Column(Integer, default=0)
    total_messages_failed = Column(Integer, default=0)
    total_messages_read = Column(Integer, default=0)
    last_message_at = Column(DateTime)
    total_time_spent = Column(Interval)
    created_at = Column(DateTime, default=datetime.datetime.now)

class UserConversation(Base, SerializerMixin):
    __tablename__ = "user_conversations"

    id = Column(String, primary_key=True)
    interaction_id = Column(String, ForeignKey("user_campaign_interactions.id"), nullable=False)
    from_user = Column(Boolean, default=False)
    sender_name = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    message_type = Column(Enum(MessageType), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now)

class CampaignJob(Base, SerializerMixin):
    __tablename__ = "campaign_jobs"

    id = Column(String, primary_key=True)  # Celery Job ID
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    schedule_time = Column(DateTime, nullable=False)
    retry_interval = Column(Integer, nullable=True)
    retry_attempts = Column(Integer, nullable=True)
    status = Column(String, default="Scheduled")  # Scheduled, Completed, Failed, Cancelled, InProcess
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, onupdate=datetime.datetime.now)