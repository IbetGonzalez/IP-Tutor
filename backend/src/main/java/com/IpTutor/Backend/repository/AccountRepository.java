package com.IpTutor.Backend.repository;

import com.IpTutor.Backend.model.Account;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends MongoRepository<Account, ObjectId> {
    Optional<Account> findByEmail(String email);
}
