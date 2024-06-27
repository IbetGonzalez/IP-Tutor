package com.IpTutor.Backend.repository;

import com.IpTutor.Backend.model.Game;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends MongoRepository<Game, ObjectId> {
}
